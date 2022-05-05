import Expression from "../parser/Expression";
import VariableState from "./VariableState";

class VariableRecord {
  value: Expression | null;
  state: VariableState;

  constructor(value: Expression | null, state: VariableState) {
    this.value = value;
    this.state = state;
  }
}

type VariableRecordMap = Record<string, VariableRecord>;

export default VariableRecord;

export { type VariableRecordMap };
