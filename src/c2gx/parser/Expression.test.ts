import Token from "../tokenizer/Token";
import TokenType from "../tokenizer/TokenType";
import { AssignExpression, GroupExpression } from "./Expression";
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
});
