import Parser from "../parser/Parser";
import Statement from "../parser/Statement";
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
    while (true) {
      const graph = new Graph(statements);
      graph.iterativeConstantAnalysis(variables);
      const output = graph.getOutput();
      const blocks = graph.getBlocksWithoutEntry();
      for (const block of blocks) {
        const input = Object.fromEntries(
          Object.entries(block.input).filter(
            ([v, record]) => record.state !== VariableState.RUNTIME
          )
        );
        block.statement.replace(input, output);
      }
      if (this.isSameOutput(lastOutput, output)) {
        return blocks;
      }
      lastOutput = output;
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
}

export default Compiler;
