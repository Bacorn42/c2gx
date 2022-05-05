import Token from "../tokenizer/Token";
import TokenType from "../tokenizer/TokenType";

abstract class Expression {
  abstract translate(): string;
  abstract evaluate(): Expression;

  protected evaluateBinary(expr: Expression): Expression {
    if (expr instanceof BinaryExpression) {
      const left = expr.exprLeft.evaluate();
      const right = expr.exprRight.evaluate();
      if (left instanceof LiteralExpression && right instanceof LiteralExpression) {
        if (!isNaN(left.token.value) && !isNaN(right.token.value)) {
          const value = this.evaluateLiterals(left.token.value, right.token.value, expr.operator);
          return new LiteralExpression(new Token(TokenType.INTEGER, String(value), 1));
        }
      }
      return new BinaryExpression(left, expr.operator, right);
    }
    return expr;
  }

  private evaluateLiterals(left: number, right: number, operator: Token): number {
    switch (operator.type) {
      case TokenType.PLUS:
        return left + right;
      case TokenType.MINUS:
        return left - right;
      case TokenType.TIMES:
        return left * right;
      case TokenType.DIVIDE:
        return Math.floor(left / right);
      case TokenType.MOD:
        return left % right;
      case TokenType.LESS:
        return left < right ? 1 : 0;
      case TokenType.LESS_EQUAL:
        return left <= right ? 1 : 0;
      case TokenType.GREATER:
        return left > right ? 1 : 0;
      case TokenType.GREATER_EQUAL:
        return left >= right ? 1 : 0;
      default:
        throw Error("Unsupported operator");
    }
  }
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

  evaluate(): Expression {
    this.exprLeft = this.evaluateBinary(this.exprLeft);
    this.exprRight = this.evaluateBinary(this.exprRight);
    return this.evaluateBinary(this);
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

  evaluate(): Expression {
    this.exprRight = this.evaluateBinary(this.exprRight);
    return this;
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

  evaluate(): Expression {
    this.expr = this.evaluateBinary(this.expr);
    return this.expr;
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

  evaluate(): Expression {
    return this;
  }
}

export default Expression;

export { BinaryExpression, AssignExpression, GroupExpression, LiteralExpression };
