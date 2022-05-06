import { LiteralExpression } from "../parser/Expression";
import Parser from "../parser/Parser";
import Statement, {
  EmptyStatement,
  GotoStatement,
  IfStatement,
  LabelStatement,
} from "../parser/Statement";
import Token from "../tokenizer/Token";
import Block from "./Block";
import Graph from "./Graph";
import { VariableRecordMap } from "./VariableRecord";
import VariableState from "./VariableState";

class Compiler {
  private code: string;

  constructor(code: string) {
    this.code = code;
  }

  compile(): string {
    const parser = new Parser(this.code);
    const statements = parser.getStatements();

    let newCode = "";
    for (const statement of statements) {
      newCode += statement.translate();
    }

    const newParser = new Parser(newCode);
    const newStatements = newParser.getStatements();
    const variables = newParser.getVariables();

    const blocks = this.optimize(newStatements, variables);
    newCode = "";
    for (const block of blocks) {
      newCode += block.statement.output();
    }

    return newCode;
  }

  private optimize(statements: Statement[], variables: Record<string, Token>): Block[] {
    let lastOutput: VariableRecordMap = {};
    let lastBlockCount = 0;
    while (true) {
      if (statements.length === 0) {
        return [];
      }
      const graph = new Graph(statements);
      graph.iterativeConstantAnalysis(variables);
      const output = graph.getOutput();
      let blocks = graph.getBlocksWithoutEntry();
      for (const block of blocks) {
        const input = Object.fromEntries(
          Object.entries(block.input).filter(
            ([v, record]) => record.state !== VariableState.RUNTIME
          )
        );
        block.statement.replace(input, output);
      }
      blocks = this.evaluateIfs(blocks);
      blocks = this.removeDeadCode(blocks);
      if (this.isSameOutput(lastOutput, output) && lastBlockCount === blocks.length) {
        return blocks;
      }
      lastOutput = output;
      lastBlockCount = blocks.length;
      statements = blocks.map((b) => b.statement);
    }
  }

  private isSameOutput(output1: VariableRecordMap, output2: VariableRecordMap): boolean {
    if (Object.keys(output1).length !== Object.keys(output2).length) {
      return false;
    }
    for (const [variable, record] of Object.entries(output1)) {
      if (!(variable in output2)) {
        return false;
      }
      if (
        record.state !== output2[variable].state ||
        record.value?.toString() !== output2[variable].value?.toString()
      ) {
        return false;
      }
    }
    return true;
  }

  private evaluateIfs(blocks: Block[]): Block[] {
    for (const block of blocks) {
      if (block.statement instanceof IfStatement) {
        const val = block.statement.getFirstCondition().evaluate();
        if (val instanceof LiteralExpression) {
          if (val.token.value === 0) {
            block.statement = new EmptyStatement();
          } else {
            block.statement = block.statement.getFirstStatement();
          }
        }
      }
    }
    return this.removeEmptyBlocks(blocks);
  }

  private removeDeadCode(blocks: Block[]): Block[] {
    let changed = true;
    while (changed) {
      changed = false;
      const labels = this.getLabels(blocks);

      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const prevBlock = i > 0 ? blocks[i - 1] : null;
        if (block.statement instanceof LabelStatement) {
          if (prevBlock?.statement instanceof GotoStatement) {
            if (prevBlock.statement.getLabel() === block.statement.getLabel()) {
              prevBlock.statement = new EmptyStatement();
              changed = true;
            }
          }
          if (!labels.has(block.statement.getLabel())) {
            block.statement = new EmptyStatement();
            changed = true;
          }
        }
        if (block.statement instanceof GotoStatement) {
          if (prevBlock?.statement instanceof GotoStatement) {
            block.statement = new EmptyStatement();
            changed = true;
          } else if (prevBlock?.statement instanceof LabelStatement) {
            if (block.statement.getLabel() === prevBlock.statement.getLabel()) {
              block.statement = new EmptyStatement();
              changed = true;
            }
          }
        }
        if (block.predecessors.length === 0) {
          block.statement = new EmptyStatement();
          changed = true;
        }
      }
      blocks = this.removeEmptyBlocks(blocks);
    }
    return blocks;
  }

  private getLabels(blocks: Block[]): Set<string> {
    const labels = new Set<string>();
    for (const block of blocks) {
      let statement = block.statement;
      if (statement instanceof IfStatement) {
        statement = statement.getFirstStatement();
      }
      if (statement instanceof GotoStatement) {
        labels.add(statement.getLabel());
      }
    }
    return labels;
  }

  private removeEmptyBlocks(blocks: Block[]): Block[] {
    return blocks.filter((b) => !(b.statement instanceof EmptyStatement));
  }
}

export default Compiler;
