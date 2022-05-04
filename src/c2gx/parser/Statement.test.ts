import Token from "../tokenizer/Token";
import TokenType from "../tokenizer/TokenType";
import { LiteralExpression } from "./Expression";
import If from "./If";
import {
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
  BinaryExpressionFactory,
  BinaryExpressionStatementFactory,
  ExpressionStatementFactory,
  LiteralExpressionFactory,
} from "./testUtil";

describe("Statement", () => {
  describe("Translations", () => {
    it("Should translate game statement", () => {
      const stmt = new GameStatement('"Levelset"');
      expect(stmt.translate()).toStrictEqual('game "Levelset"');
    });

    it("Should translate map statement", () => {
      const stmt = new MapStatement('"level.c2m"');
      expect(stmt.translate()).toStrictEqual('map "level.c2m"');
    });

    it("Should translate music statement", () => {
      const stmt = new MusicStatment('"song.mp3"');
      expect(stmt.translate()).toStrictEqual('music "song.mp3"');
    });

    it("Should translate script statement", () => {
      const stmt = new ScriptStatement(['"Some text"', '"More text"', '"Some more text"']);
      expect(stmt.translate()).toStrictEqual('script\n"Some text"\n"More text"\n"Some more text"');
    });

    it("Should translate complete if statement", () => {
      const stmt = new IfStatement(
        [
          new If(BinaryExpressionFactory(1, new Token(TokenType.LESS, "<", 1), 2), [
            LiteralExpressionFactory(3),
          ]),
          new If(BinaryExpressionFactory(4, new Token(TokenType.LESS, "<", 1), 5), [
            LiteralExpressionFactory(6),
          ]),
        ],
        [LiteralExpressionFactory(7)],
        0
      );
      const expectedString =
        "if 1 < 2 goto #if0x0 end" +
        "\nif 4 < 5 goto #if0x1 end" +
        "\ngoto #else0" +
        "\n#if0x0" +
        "\n3" +
        "\ngoto #endif0" +
        "\n#if0x1" +
        "\n6" +
        "\ngoto #endif0" +
        "\n#else0" +
        "\n7" +
        "\n#endif0";

      expect(stmt.translate()).toStrictEqual(expectedString);
    });

    it("Should translate if statement without else", () => {
      const stmt = new IfStatement(
        [
          new If(BinaryExpressionFactory(1, new Token(TokenType.LESS, "<", 1), 2), [
            LiteralExpressionFactory(3),
          ]),
          new If(BinaryExpressionFactory(4, new Token(TokenType.LESS, "<", 1), 5), [
            LiteralExpressionFactory(6),
          ]),
        ],
        [],
        0
      );

      const expectedString =
        "if 1 < 2 goto #if0x0 end" +
        "\nif 4 < 5 goto #if0x1 end" +
        "\ngoto #else0" +
        "\n#if0x0" +
        "\n3" +
        "\ngoto #endif0" +
        "\n#if0x1" +
        "\n6" +
        "\ngoto #endif0" +
        "\n#else0" +
        "\n" +
        "\n#endif0";

      expect(stmt.translate()).toStrictEqual(expectedString);
    });

    it("Should translate while statement", () => {
      const stmt = new WhileStatement(
        BinaryExpressionFactory(1, new Token(TokenType.LESS, "<", 1), 2),
        [LiteralExpressionFactory(3)],
        0
      );
      const expectedString =
        "#while0" +
        "\nif 1 < 2 goto #whileloop0 end" +
        "\ngoto endwhile0" +
        "\n#whileloop0" +
        "\n3" +
        "\ngoto #while0" +
        "\n#endwhile0";

      expect(stmt.translate()).toStrictEqual(expectedString);
    });

    it("Should translate for loop", () => {
      const stmt = new ForStatement(
        LiteralExpressionFactory("i"),
        LiteralExpressionFactory(1),
        LiteralExpressionFactory(5),
        LiteralExpressionFactory(2),
        [LiteralExpressionFactory(3)],
        0
      );

      const expectedString =
        "i = 1" +
        "\n#for0" +
        "\nif i < 5 goto #forloop0 end" +
        "\ngoto #endfor0" +
        "\n#forloop0" +
        "\n3" +
        "\ni = i + 2" +
        "\ngoto #for0" +
        "\n#endfor0";

      expect(stmt.translate()).toStrictEqual(expectedString);
    });

    it("Should translate label statement", () => {
      const stmt = new LabelStatement("#start");
      expect(stmt.translate()).toStrictEqual("#start");
    });

    it("Should translate goto statement", () => {
      const stmt = new GotoStatement(new LabelStatement("#start"));
      expect(stmt.translate()).toStrictEqual("goto #start");
    });

    it("Should translate expression statement", () => {
      const stmt1 = ExpressionStatementFactory(1);
      expect(stmt1.translate()).toStrictEqual("1");

      const stmt2 = BinaryExpressionStatementFactory(1, new Token(TokenType.TIMES, "*", 1), 2);
      expect(stmt2.translate()).toStrictEqual("1 * 2");
    });
  });
});
