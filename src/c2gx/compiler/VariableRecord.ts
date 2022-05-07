import Expression from "../parser/Expression";
import VariableState from "./VariableState";

class VariableRecord {
  value: Expression;
  state: VariableState;
  start: number = 0;
  length: number;

  constructor(value: Expression, state: VariableState, length: number = 32) {
    this.value = value;
    this.state = state;
    this.length = length;
  }

  setStart(start: number) {
    this.start = start;
  }
}

type VariableRecordMap = Record<string, VariableRecord>;

export default VariableRecord;

export { type VariableRecordMap };
