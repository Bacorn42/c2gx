import Expression from "../parser/Expression";
import VariableState from "./VariableState";

class VariableRecord {
  value: Expression;
  state: VariableState;
  start: number = 0;
  length: number = 0;

  constructor(value: Expression, state: VariableState) {
    this.value = value;
    this.state = state;
  }

  setBits(start: number, length: number) {
    this.start = start;
    this.length = length;
  }
}

type VariableRecordMap = Record<string, VariableRecord>;

export default VariableRecord;

export { type VariableRecordMap };
