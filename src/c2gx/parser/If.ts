import Statement from "./Statement";
import Expression from "./Expression";

class If {
  condition: Expression;
  statements: Statement[];

  constructor(condition: Expression, statements: Statement[]) {
    this.condition = condition;
    this.statements = statements;
  }
}

export default If;
