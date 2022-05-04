import Token from "../tokenizer/Token";
import TokenType from "../tokenizer/TokenType";
import {
  AssignExpression,
  BinaryExpression,
  GroupExpression,
  LiteralExpression,
} from "./Expression";
import If from "./If";
import Parser from "./Parser";
import {
  ExpressionStatement,
  ForStatement,
  GameStatement,
  GotoStatement,
  IfStatement,
  LabelStatement,
  MapStatement,
  MusicStatment,
  ScriptStatement,
  WhileStatement,
} from "./Statement";
import {
  LiteralExpressionFactory,
  ExpressionStatementFactory,
  BinaryExpressionFactory,
  BinaryExpressionStatementFactory,
} from "./testUtil";

describe("Parser", () => {
  describe("Basic parsing", () => {
    it("Should parse literals", () => {
      const code = '1 var2 "some string"';
      const expectedStatements = [
        ExpressionStatementFactory(1),
        ExpressionStatementFactory("var2"),
        ExpressionStatementFactory('"some string"'),
      ];
      const parser = new Parser(code);
      debugger;
      expect(parser.getStatements()).toStrictEqual(expectedStatements);
    });

    it("Should parse addition and subtraction", () => {
      const code = "1 + 2   3 - 4";
      const expectedStatements = [
        BinaryExpressionStatementFactory(1, new Token(TokenType.PLUS, "+", 1), 2),
        BinaryExpressionStatementFactory(3, new Token(TokenType.MINUS, "-", 1), 4),
      ];
      const parser = new Parser(code);
      expect(parser.getStatements()).toStrictEqual(expectedStatements);
    });

    it("Should parse multiplication, division, and mod", () => {
      const code = "1 * 2   3 / 4   5 % 6";
      const expectedStatements = [
        BinaryExpressionStatementFactory(1, new Token(TokenType.TIMES, "*", 1), 2),
        BinaryExpressionStatementFactory(3, new Token(TokenType.DIVIDE, "/", 1), 4),
        BinaryExpressionStatementFactory(5, new Token(TokenType.MOD, "%", 1), 6),
      ];
      const parser = new Parser(code);
      expect(parser.getStatements()).toStrictEqual(expectedStatements);
    });

    it("Should parse comparison", () => {
      const code = "1 > 2   3 < 4";
      const expectedStatements = [
        BinaryExpressionStatementFactory(1, new Token(TokenType.GREATER, ">", 1), 2),
        BinaryExpressionStatementFactory(3, new Token(TokenType.LESS, "<", 1), 4),
      ];
      const parser = new Parser(code);
      expect(parser.getStatements()).toStrictEqual(expectedStatements);
    });

    it("Should parse equality", () => {
      const code = "1 == 2   3 != 4";
      const expectedStatements = [
        BinaryExpressionStatementFactory(1, new Token(TokenType.EQUAL_EQUAL, "==", 1), 2),
        BinaryExpressionStatementFactory(3, new Token(TokenType.NOT_EQUAL, "!=", 1), 4),
      ];
      const parser = new Parser(code);
      expect(parser.getStatements()).toStrictEqual(expectedStatements);
    });

    it("Should parse bitwise operators", () => {
      const code = "1 & 2   3 | 4   5 ^ 6";
      const expectedStatements = [
        BinaryExpressionStatementFactory(1, new Token(TokenType.AND, "&", 1), 2),
        BinaryExpressionStatementFactory(3, new Token(TokenType.OR, "|", 1), 4),
        BinaryExpressionStatementFactory(5, new Token(TokenType.XOR, "^", 1), 6),
      ];
      const parser = new Parser(code);
      expect(parser.getStatements()).toStrictEqual(expectedStatements);
    });

    it("Should parse boolean operators", () => {
      const code = "1 && 2   3 || 4";
      const expectedStatements = [
        BinaryExpressionStatementFactory(1, new Token(TokenType.AND_AND, "&&", 1), 2),
        BinaryExpressionStatementFactory(3, new Token(TokenType.OR_OR, "||", 1), 4),
      ];
      const parser = new Parser(code);
      expect(parser.getStatements()).toStrictEqual(expectedStatements);
    });

    it("Should parse assignment", () => {
      const code = "var = 1";
      const expectedStatements = [
        new ExpressionStatement(
          new AssignExpression(
            new Token(TokenType.VARIABLE, "var", 1),
            new Token(TokenType.EQUAL, "=", 1),
            LiteralExpressionFactory(1)
          )
        ),
      ];
      const parser = new Parser(code);
      expect(parser.getStatements()).toStrictEqual(expectedStatements);
    });

    it("Should throw error on assignment to non-variable", () => {
      const code = "1 = 2";
      expect(() => {
        new Parser(code);
      }).toThrow("Cannot assign");
    });

    it("Should parse group expression", () => {
      const code = "(1)";
      const expectedStatements = [
        new ExpressionStatement(new GroupExpression(LiteralExpressionFactory(1))),
      ];
      const parser = new Parser(code);
      expect(parser.getStatements()).toStrictEqual(expectedStatements);
    });

    it("Should parse game expression", () => {
      const code = 'game "Levelset"';
      const expectedStatements = [new GameStatement('"Levelset"')];
      const parser = new Parser(code);
      expect(parser.getStatements()).toStrictEqual(expectedStatements);
    });

    it("Should parse map statement", () => {
      const code = 'map "level.c2m"';
      const expectedStatements = [new MapStatement('"level.c2m"')];
      const parser = new Parser(code);
      expect(parser.getStatements()).toStrictEqual(expectedStatements);
    });

    it("Should parse music statement", () => {
      const code = 'music "song.mp3"';
      const expectedStatements = [new MusicStatment('"song.mp3"')];
      const parser = new Parser(code);
      expect(parser.getStatements()).toStrictEqual(expectedStatements);
    });

    it("Should parse script statement", () => {
      const code = "script" + '\n"Some text"' + '\n"Some more text"' + '\n"Even more text"';
      const expectedStatements = [
        new ScriptStatement(['"Some text"', '"Some more text"', '"Even more text"']),
      ];
      const parser = new Parser(code);
      expect(parser.getStatements()).toStrictEqual(expectedStatements);
    });

    it("Should parse simple if statement", () => {
      const code = "if var == 1 1 end";
      const expectedStatements = [
        new IfStatement(
          [
            new If(BinaryExpressionFactory("var", new Token(TokenType.EQUAL_EQUAL, "==", 1), 1), [
              ExpressionStatementFactory(1),
            ]),
          ],
          [],
          0
        ),
      ];
      const parser = new Parser(code);
      expect(parser.getStatements()).toStrictEqual(expectedStatements);
    });

    it("Should parse label statement", () => {
      const code = "#start";
      const expectedStatements = [new LabelStatement("#start")];
      const parser = new Parser(code);
      expect(parser.getStatements()).toStrictEqual(expectedStatements);
    });

    it("Should parse goto statement", () => {
      const code = "goto #start";
      const expectedStatements = [new GotoStatement(new LabelStatement("#start"))];
      const parser = new Parser(code);
      expect(parser.getStatements()).toStrictEqual(expectedStatements);
    });
  });

  describe("Compound parsing", () => {
    it("Should parse nested expression", () => {
      const code = "1 + 2 + 3 - 4";
      const expectedStatements = [
        new ExpressionStatement(
          new BinaryExpression(
            new BinaryExpression(
              BinaryExpressionFactory(1, new Token(TokenType.PLUS, "+", 1), 2),
              new Token(TokenType.PLUS, "+", 1),
              LiteralExpressionFactory(3)
            ),
            new Token(TokenType.MINUS, "-", 1),
            LiteralExpressionFactory(4)
          )
        ),
      ];
      const parser = new Parser(code);
      expect(parser.getStatements()).toStrictEqual(expectedStatements);
    });

    it("Should parse operator precedence", () => {
      const code = "1 & 2 + 3 * 4";
      const expectedStatements = [
        new ExpressionStatement(
          new BinaryExpression(
            LiteralExpressionFactory(1),
            new Token(TokenType.AND, "&", 1),
            new BinaryExpression(
              LiteralExpressionFactory(2),
              new Token(TokenType.PLUS, "+", 1),
              BinaryExpressionFactory(3, new Token(TokenType.TIMES, "*", 1), 4)
            )
          )
        ),
      ];
      const parser = new Parser(code);
      expect(parser.getStatements()).toStrictEqual(expectedStatements);
    });

    it("Should parse complete if statement", () => {
      const code = "if var == 1 1 elseif var == 2 2 elseif var == 3 3 else 4 end";
      const expectedStatements = [
        new IfStatement(
          [
            new If(BinaryExpressionFactory("var", new Token(TokenType.EQUAL_EQUAL, "==", 1), 1), [
              ExpressionStatementFactory(1),
            ]),
            new If(BinaryExpressionFactory("var", new Token(TokenType.EQUAL_EQUAL, "==", 1), 2), [
              ExpressionStatementFactory(2),
            ]),
            new If(BinaryExpressionFactory("var", new Token(TokenType.EQUAL_EQUAL, "==", 1), 3), [
              ExpressionStatementFactory(3),
            ]),
          ],
          [ExpressionStatementFactory(4)],
          0
        ),
      ];
      const parser = new Parser(code);
      expect(parser.getStatements()).toStrictEqual(expectedStatements);
    });

    it("Should parse if statement without else", () => {
      const code = "if var == 1 1 elseif var == 2 2 end";
      const expectedStatements = [
        new IfStatement(
          [
            new If(BinaryExpressionFactory("var", new Token(TokenType.EQUAL_EQUAL, "==", 1), 1), [
              ExpressionStatementFactory(1),
            ]),
            new If(BinaryExpressionFactory("var", new Token(TokenType.EQUAL_EQUAL, "==", 1), 2), [
              ExpressionStatementFactory(2),
            ]),
          ],
          [],
          0
        ),
      ];
      const parser = new Parser(code);
      expect(parser.getStatements()).toStrictEqual(expectedStatements);
    });

    it("Should parse while statement", () => {
      const code = "while var == 1 1 end";
      const expectedStatements = [
        new WhileStatement(
          BinaryExpressionFactory("var", new Token(TokenType.EQUAL_EQUAL, "==", 1), 1),
          [ExpressionStatementFactory(1)],
          0
        ),
      ];
      const parser = new Parser(code);
      expect(parser.getStatements()).toStrictEqual(expectedStatements);
    });

    it("Should parse for statement", () => {
      const code = "for i from 1 to 5 by 2 3 end";
      const expectedStatements = [
        new ForStatement(
          LiteralExpressionFactory("i"),
          LiteralExpressionFactory(1),
          LiteralExpressionFactory(5),
          LiteralExpressionFactory(2),
          [ExpressionStatementFactory(3)],
          0
        ),
      ];
      const parser = new Parser(code);
      expect(parser.getStatements()).toStrictEqual(expectedStatements);
    });
  });
});
