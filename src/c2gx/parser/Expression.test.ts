import Token from "../tokenizer/Token";
import TokenType from "../tokenizer/TokenType";
import {
  AssignExpression,
  BinaryExpression,
  GroupExpression,
  LiteralExpression,
} from "./Expression";
import { BinaryExpressionFactory, LiteralExpressionFactory } from "./testUtil";

describe("Expression", () => {
  describe("Translations", () => {
    it("Should translate binary expression", () => {
      const expr = BinaryExpressionFactory(1, new Token(TokenType.PLUS, "+", 1), 2);
      expect(expr.translate()).toStrictEqual("1 + 2");
    });

    it("Should translate assignment expression", () => {
      const expr = new AssignExpression(
        new Token(TokenType.VARIABLE, "var", 1),
        new Token(TokenType.EQUAL, "=", 1),
        LiteralExpressionFactory(1)
      );
      expect(expr.translate()).toStrictEqual("var = 1");
    });

    it("Should translate group expression", () => {
      const expr = new GroupExpression(
        BinaryExpressionFactory(1, new Token(TokenType.PLUS, "+", 1), 2)
      );
      expect(expr.translate()).toStrictEqual("(1 + 2)");
    });

    it("Should translate literal expressions", () => {
      const expr1 = LiteralExpressionFactory(1);
      expect(expr1.translate()).toStrictEqual("1");

      const expr2 = LiteralExpressionFactory('"some string"');
      expect(expr2.translate()).toStrictEqual('"some string"');

      const expr3 = LiteralExpressionFactory("var");
      expect(expr3.translate()).toStrictEqual("var");
    });
  });

  describe("Evaluations", () => {
    it("Should evaluate addition", () => {
      const expr = BinaryExpressionFactory(1, new Token(TokenType.PLUS, "+", 1), 2);
      const expectedValue = LiteralExpressionFactory(3);
      expect(expr.evaluate()).toStrictEqual(expectedValue);
    });

    it("Should evaluate nested expressions", () => {
      const expr = new BinaryExpression(
        new BinaryExpression(
          BinaryExpressionFactory(24, new Token(TokenType.DIVIDE, "/", 1), 3),
          new Token(TokenType.PLUS, "+", 1),
          LiteralExpressionFactory(4)
        ),
        new Token(TokenType.PLUS, "+", 1),
        new BinaryExpression(
          LiteralExpressionFactory(5),
          new Token(TokenType.TIMES, "*", 1),
          BinaryExpressionFactory(6, new Token(TokenType.MINUS, "-", 1), 2)
        )
      );
      const expectedValue = LiteralExpressionFactory(32);
      expect(expr.evaluate()).toStrictEqual(expectedValue);
    });

    it("Should not evaluate variables", () => {
      const expr = new BinaryExpression(
        LiteralExpressionFactory(3),
        new Token(TokenType.PLUS, "+", 1),
        LiteralExpressionFactory("var")
      );
      expect(expr.evaluate()).toStrictEqual(expr);
    });

    it("Should evaluate right side of assignment expression", () => {
      const expr = new AssignExpression(
        new Token(TokenType.VARIABLE, "var", 1),
        new Token(TokenType.EQUAL, "=", 1),
        BinaryExpressionFactory(2, new Token(TokenType.PLUS, "+", 1), 3)
      );
      const expectedValue = new AssignExpression(
        new Token(TokenType.VARIABLE, "var", 1),
        new Token(TokenType.EQUAL, "=", 1),
        LiteralExpressionFactory(5)
      );
      expect(expr.evaluate()).toStrictEqual(expectedValue);
    });

    it("Should evaluate group expression", () => {
      const expr = new GroupExpression(
        BinaryExpressionFactory(2, new Token(TokenType.PLUS, "+", 1), 3)
      );
      const expectedValue = LiteralExpressionFactory(5);
      expect(expr.evaluate()).toStrictEqual(expectedValue);
    });
  });
});
