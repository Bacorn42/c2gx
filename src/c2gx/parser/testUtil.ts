import { LiteralExpression, BinaryExpression } from "./Expression";
import { ExpressionStatement } from "./Statement";
import Token from "../tokenizer/Token";
import TokenType from "../tokenizer/TokenType";

const LiteralExpressionFactory = (value: number | string, line = 1): LiteralExpression => {
  if (typeof value === "number") {
    return new LiteralExpression(new Token(TokenType.INTEGER, String(value), line));
  }
  if (value[0] === '"') {
    return new LiteralExpression(new Token(TokenType.STRING, value, line));
  }
  return new LiteralExpression(new Token(TokenType.VARIABLE, value, line));
};

const BinaryExpressionFactory = (
  leftValue: number | string,
  operator: Token,
  rightValue: number | string,
  line = 1
): BinaryExpression => {
  return new BinaryExpression(
    LiteralExpressionFactory(leftValue, line),
    operator,
    LiteralExpressionFactory(rightValue, line)
  );
};

const ExpressionStatementFactory = (value: number | string, line = 1): ExpressionStatement => {
  return new ExpressionStatement(LiteralExpressionFactory(value, line));
};

const BinaryExpressionStatementFactory = (
  leftValue: number | string,
  operator: Token,
  rightValue: number | string,
  line = 1
): ExpressionStatement => {
  return new ExpressionStatement(BinaryExpressionFactory(leftValue, operator, rightValue, line));
};

export {
  LiteralExpressionFactory,
  BinaryExpressionFactory,
  ExpressionStatementFactory,
  BinaryExpressionStatementFactory,
};
