import Expression from "../parser/Expression";
import VariableState from "./VariableState";

class VariableRecord {
  value: Expression;
  state: VariableState;

  constructor(value: Expression, state: VariableState) {
    this.value = value;
    this.state = state;
  }
}

export default VariableRecord;
