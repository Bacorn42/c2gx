import Statement from "../parser/Statement";
import VariableRecord from "./VariableRecord";

class Block {
  statement: Statement;
  predecessors: Block[] = [];
  successors: Block[] = [];
  private input: { [key: string]: VariableRecord } = {};
  private output: { [key: string]: VariableRecord } = {};

  constructor(statement: Statement) {
    this.statement = statement;
  }
}

class SimpleBlock {
  statement: Statement;
  successors: number[];
  predecessors: number[];

  constructor(statement: Statement, successors: number[] = [], predecessors: number[] = []) {
    this.statement = statement;
    this.successors = successors;
    this.predecessors = predecessors;
  }
}

export default Block;

export { SimpleBlock };
