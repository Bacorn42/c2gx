import Token from "../tokenizer/Token";

abstract class Expression {
  abstract translate(): string;
}

class BinaryExpression extends Expression {
  exprLeft: Expression;
  operator: Token;
  exprRight: Expression;

  constructor(exprLeft: Expression, operator: Token, exprRight: Expression) {
    super();
    this.exprLeft = exprLeft;
    this.operator = operator;
    this.exprRight = exprRight;
  }

  translate(): string {
    return `${this.exprLeft.translate()} ${this.operator.lexeme} ${this.exprRight.translate()}`;
  }
}

class AssignExpression extends Expression {
  variable: Token;
  operator: Token;
  exprRight: Expression;

  constructor(variable: Token, operator: Token, exprRight: Expression) {
    super();
    this.variable = variable;
    this.operator = operator;
    this.exprRight = exprRight;
  }

  translate(): string {
    return `${this.variable.lexeme} ${this.operator.lexeme} ${this.exprRight.translate()}`;
  }
}

class GroupExpression extends Expression {
  expr: Expression;

  constructor(expr: Expression) {
    super();
    this.expr = expr;
  }

  translate(): string {
    return `(${this.expr.translate()})`;
  }
}

class LiteralExpression extends Expression {
  token: Token;

  constructor(token: Token) {
    super();
    this.token = token;
  }

  translate(): string {
    return `${this.token.lexeme}`;
  }
}

export default Expression;

export { BinaryExpression, AssignExpression, GroupExpression, LiteralExpression };
