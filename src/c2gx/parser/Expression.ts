import gameVariables from "../compiler/gameVariables";
import VariableRecord, { VariableRecordMap } from "../compiler/VariableRecord";
import VariableState from "../compiler/VariableState";
import Token from "../tokenizer/Token";
import TokenType from "../tokenizer/TokenType";
import Parser from "./Parser";
import { ExpressionStatement } from "./Statement";
import { LiteralExpressionFactory } from "./testUtil";

abstract class Expression {
  abstract translate(): string;
  abstract evaluate(): Expression;
  abstract traverse(process: (expr: Expression) => void): void;
  abstract replace(vars: VariableRecordMap, output: VariableRecordMap): void;
  abstract toString(): string;

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
      case TokenType.AND:
        return left & right;
      case TokenType.OR:
        return left | right;
      case TokenType.XOR:
        return left ^ right;
      case TokenType.AND_AND:
        return left && right ? 1 : 0;
      case TokenType.OR_OR:
        return left || right ? 1 : 0;
      default:
        throw Error("Unsupported operator");
    }
  }

  protected replaceVariable(
    expr: Expression,
    vars: VariableRecordMap,
    output: VariableRecordMap
  ): Expression {
    if (expr instanceof LiteralExpression) {
      if (expr.token.type === TokenType.VARIABLE) {
        const variable = expr.token.lexeme;
        if (!gameVariables.includes(variable) && variable in vars) {
          if (output[variable].state !== VariableState.RUNTIME) {
            return vars[variable].value as Expression;
          }
          return new RuntimeVariableExpression(output[variable]);
        }
      }
    }
    return expr;
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

  traverse(process: (expr: Expression) => void): void {
    process(this);
    this.exprLeft.traverse(process);
    this.exprRight.traverse(process);
  }

  replace(vars: VariableRecordMap, output: VariableRecordMap): void {
    this.exprLeft.replace(vars, output);
    this.exprRight.replace(vars, output);
    this.exprLeft = this.replaceVariable(this.exprLeft, vars, output);
    this.exprRight = this.replaceVariable(this.exprRight, vars, output);
  }

  toString(): string {
    return `BinaryExpression(${this.exprLeft} ${this.operator.lexeme}, ${this.exprRight})`;
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

  traverse(process: (expr: Expression) => void): void {
    process(this);
    this.exprRight.traverse(process);
  }

  replace(vars: VariableRecordMap, output: VariableRecordMap): void {
    this.exprRight.replace(vars, output);
    this.exprRight = this.replaceVariable(this.exprRight, vars, output);
  }

  replaceRuntime(output: VariableRecordMap) {
    const variable = output[this.variable.lexeme];
    if (variable.state === VariableState.RUNTIME) {
      const runtimeVariable = new RuntimeVariableExpression(variable);
      this.variable.lexeme = runtimeVariable.getRegister();
      const mod = 2 ** variable.length;
      const bitshiftRight = 2 ** (32 - variable.length - variable.start);

      const modStr = mod << 0 === 0 ? "" : ` % ${mod}`;
      const bitshiftRightStr = bitshiftRight > 1 ? ` * ${bitshiftRight}` : "";

      const newExprStr = `${runtimeVariable.getRegister()} | ((${this.exprRight.translate()}${modStr})${bitshiftRightStr})`;
      const parser = new Parser(newExprStr);
      this.exprRight = (parser.getStatements()[0] as ExpressionStatement).getExpr();
    }
  }

  toString(): string {
    return `AssignExpression(${this.variable.lexeme} ${this.operator.lexeme} ${this.exprRight})`;
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

  traverse(process: (expr: Expression) => void): void {
    process(this);
    this.expr.traverse(process);
  }

  replace(vars: VariableRecordMap, output: VariableRecordMap): void {
    this.expr.replace(vars, output);
    this.expr = this.replaceVariable(this.expr, vars, output);
  }

  toString(): string {
    return `GroupExpression(${this.expr})`;
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

  traverse(process: (expr: Expression) => void): void {
    process(this);
  }

  replace(vars: VariableRecordMap, output: VariableRecordMap): void {}

  toString(): string {
    return `LiteralExpression(${this.token.lexeme})`;
  }
}

class RuntimeVariableExpression extends Expression {
  private record: VariableRecord;

  constructor(record: VariableRecord) {
    super();
    this.record = record;
  }

  translate(): string {
    const mask = this.getMask();
    const register = this.getRegister();
    const bitshiftLeft = 2 ** (this.record.start % 32);
    const bitshiftRight = 2 ** (32 - this.record.length);

    const maskStr = mask === -1 ? "" : ` & ${mask}`;
    const bitshiftLeftStr = bitshiftLeft > 1 ? ` * ${bitshiftLeft}` : "";
    const bitshiftRightStr = bitshiftRight > 1 ? ` / ${bitshiftRight}` : "";
    return `(((${register}${maskStr})${bitshiftLeftStr})${bitshiftRightStr})`;
  }

  evaluate(): Expression {
    return this;
  }

  traverse(process: (expr: Expression) => void): void {
    process(this);
  }

  replace(vars: VariableRecordMap, output: VariableRecordMap): void {}

  private getMask(): number {
    return (2 ** this.record.length - 1) << (32 - this.record.length - (this.record.start % 32));
  }

  getRegister(): string {
    if (this.record.start < 32) {
      return "reg1";
    } else if (this.record.start < 64) {
      return "reg2";
    } else if (this.record.start < 96) {
      return "reg3";
    } else if (this.record.start < 128) {
      return "reg4";
    } else {
      return "result";
    }
  }

  toString(): string {
    return `RuntimeVariableExpression(${this.record.value})`;
  }
}

export default Expression;

export {
  BinaryExpression,
  AssignExpression,
  GroupExpression,
  LiteralExpression,
  RuntimeVariableExpression,
};
