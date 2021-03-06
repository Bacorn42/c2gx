import { AssignExpression, LiteralExpression } from "../parser/Expression";
import Parser from "../parser/Parser";
import Statement, {
  EmptyStatement,
  ExpressionStatement,
  GotoStatement,
  IfStatement,
  LabelStatement,
} from "../parser/Statement";
import Token from "../tokenizer/Token";
import Block from "./Block";
import CompilerOptions from "./CompilerOptions";
import Graph from "./Graph";
import { VariableRecordMap } from "./VariableRecord";
import VariableState from "./VariableState";

class Compiler {
  private code: string;
  private options: CompilerOptions;

  constructor(code: string, options: CompilerOptions = {}) {
    this.code = code;
    this.options = options;
  }

  compile(): string {
    const parser = new Parser(this.code);
    const statements = parser.getStatements();
    const variables = parser.getVariables();

    let newCode = "";
    for (const statement of statements) {
      newCode += statement.translate();
    }

    const newParser = new Parser(newCode);
    const newStatements = newParser.getStatements();
    const newVariables = newParser.getVariables();
    for (const variable in variables) {
      newVariables[variable] = [newVariables[variable][0], variables[variable][1]];
    }

    const blocks = this.optimize(newStatements, newVariables);
    newCode = "";
    for (const block of blocks) {
      newCode += block.statement.output();
    }

    return newCode;
  }

  private optimize(statements: Statement[], variables: Record<string, [Token, number]>): Block[] {
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
            ([v, record]) => output[v].state !== VariableState.RUNTIME
          )
        );
        block.statement.replace(input, output);
      }
      if (!this.options.noCodeRemoval) {
        blocks = this.evaluateIfs(blocks);
        if (!this.options.noUselessExpressionRemoval) {
          blocks = this.removeUselessExpressions(blocks);
        }
        blocks = this.removeDeadCode(blocks);
      }
      if (this.isSameOutput(lastOutput, output) && lastBlockCount === blocks.length) {
        if (!this.options.noVariableReplacement) {
          blocks = this.replaceVariables(blocks, output);
        }
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

  private removeUselessExpressions(blocks: Block[]): Block[] {
    for (const block of blocks) {
      if (block.statement instanceof ExpressionStatement) {
        const expr = block.statement.getExpr();
        if (!(expr instanceof AssignExpression)) {
          block.statement = new EmptyStatement();
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

  private replaceVariables(blocks: Block[], output: VariableRecordMap): Block[] {
    blocks = this.removeConstants(blocks, output);
    if (!this.options.noRuntimeVariableReplacement) {
      this.getVariableStorage(output);
      for (const block of blocks) {
        block.statement.replace(block.input, output);
        if (block.statement instanceof ExpressionStatement) {
          const expr = block.statement.getExpr();
          if (expr instanceof AssignExpression) {
            expr.replaceRuntime(output);
          }
        }
      }
    }
    return blocks;
  }

  private removeConstants(blocks: Block[], output: VariableRecordMap): Block[] {
    for (const block of blocks) {
      const statement = block.statement;
      if (statement instanceof ExpressionStatement) {
        const expr = statement.getExpr();
        if (expr instanceof AssignExpression) {
          if (output[expr.variable.lexeme].state !== VariableState.RUNTIME) {
            block.statement = new EmptyStatement();
          }
        }
      }
    }
    return this.removeEmptyBlocks(blocks);
  }

  private getVariableStorage(output: VariableRecordMap): void {
    let start = 0;
    for (const [variable, record] of Object.entries(output)) {
      if (record.state === VariableState.RUNTIME) {
        output[variable].setStart(start);
        start += record.length;
      }
    }
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
