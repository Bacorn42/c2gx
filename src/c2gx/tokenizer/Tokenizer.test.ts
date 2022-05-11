import Token from "./Token";
import TokenType from "./TokenType";
import Tokenizer from "./Tokenizer";

describe("Tokenizer", () => {
  describe("Basic tokenization", () => {
    it("Should tokenize operators", () => {
      const code = "+ - * / = == != > >= < <= & && | || ^ % &= |= ^= %= += -= *= /=";
      const expectedTokens = [
        new Token(TokenType.PLUS, "+", 1),
        new Token(TokenType.MINUS, "-", 1),
        new Token(TokenType.TIMES, "*", 1),
        new Token(TokenType.DIVIDE, "/", 1),
        new Token(TokenType.EQUAL, "=", 1),
        new Token(TokenType.EQUAL_EQUAL, "==", 1),
        new Token(TokenType.NOT_EQUAL, "!=", 1),
        new Token(TokenType.GREATER, ">", 1),
        new Token(TokenType.GREATER_EQUAL, ">=", 1),
        new Token(TokenType.LESS, "<", 1),
        new Token(TokenType.LESS_EQUAL, "<=", 1),
        new Token(TokenType.AND, "&", 1),
        new Token(TokenType.AND_AND, "&&", 1),
        new Token(TokenType.OR, "|", 1),
        new Token(TokenType.OR_OR, "||", 1),
        new Token(TokenType.XOR, "^", 1),
        new Token(TokenType.MOD, "%", 1),
        new Token(TokenType.AND_EQUAL, "&=", 1),
        new Token(TokenType.OR_EQUAL, "|=", 1),
        new Token(TokenType.XOR_EQUAL, "^=", 1),
        new Token(TokenType.MOD_EQUAL, "%=", 1),
        new Token(TokenType.PLUS_EQUAL, "+=", 1),
        new Token(TokenType.MINUS_EQUAL, "-=", 1),
        new Token(TokenType.TIMES_EQUAL, "*=", 1),
        new Token(TokenType.DIVIDE_EQUAL, "/=", 1),
        new Token(TokenType.EOF, "", 1),
      ];
      const tokenizer = new Tokenizer(code);
      expect(tokenizer.getTokensWithoutWhitespace()).toStrictEqual(expectedTokens);
    });

    it("Should tokenize directives and keywords", () => {
      const code = "game map music script if elseif else end while for from to by";
      const expectedTokens = [
        new Token(TokenType.GAME, "game", 1),
        new Token(TokenType.MAP, "map", 1),
        new Token(TokenType.MUSIC, "music", 1),
        new Token(TokenType.SCRIPT, "script", 1),
        new Token(TokenType.IF, "if", 1),
        new Token(TokenType.ELSEIF, "elseif", 1),
        new Token(TokenType.ELSE, "else", 1),
        new Token(TokenType.END, "end", 1),
        new Token(TokenType.WHILE, "while", 1),
        new Token(TokenType.FOR, "for", 1),
        new Token(TokenType.FROM, "from", 1),
        new Token(TokenType.TO, "to", 1),
        new Token(TokenType.BY, "by", 1),
        new Token(TokenType.EOF, "", 1),
      ];
      const tokenizer = new Tokenizer(code);
      expect(tokenizer.getTokensWithoutWhitespace()).toStrictEqual(expectedTokens);
    });

    it("Should tokenize integers", () => {
      const code = "1 976 238001 0 4";
      const expectedTokens = [
        new Token(TokenType.INTEGER, "1", 1),
        new Token(TokenType.INTEGER, "976", 1),
        new Token(TokenType.INTEGER, "238001", 1),
        new Token(TokenType.INTEGER, "0", 1),
        new Token(TokenType.INTEGER, "4", 1),
        new Token(TokenType.EOF, "", 1),
      ];
      const tokenizer = new Tokenizer(code);
      expect(tokenizer.getTokensWithoutWhitespace()).toStrictEqual(expectedTokens);
    });

    it("Should tokenize strings", () => {
      const code = '"this is a string" 1 "and another string"';
      const expectedTokens = [
        new Token(TokenType.STRING, '"this is a string"', 1),
        new Token(TokenType.INTEGER, "1", 1),
        new Token(TokenType.STRING, '"and another string"', 1),
        new Token(TokenType.EOF, "", 1),
      ];
      const tokenizer = new Tokenizer(code);
      expect(tokenizer.getTokensWithoutWhitespace()).toStrictEqual(expectedTokens);
    });

    it("Should tokenize variables", () => {
      const code = "var var1 a1b2c3d4e5";
      const expectedTokens = [
        new Token(TokenType.VARIABLE, "var", 1),
        new Token(TokenType.VARIABLE, "var1", 1),
        new Token(TokenType.VARIABLE, "a1b2c3d4e5", 1),
        new Token(TokenType.EOF, "", 1),
      ];
      const tokenizer = new Tokenizer(code);
      expect(tokenizer.getTokensWithoutWhitespace()).toStrictEqual(expectedTokens);
    });

    it("Should tokenize other", () => {
      const code = "( 1 + 2 ) goto #label :";
      const expectedTokens = [
        new Token(TokenType.LEFT_PAREN, "(", 1),
        new Token(TokenType.INTEGER, "1", 1),
        new Token(TokenType.PLUS, "+", 1),
        new Token(TokenType.INTEGER, "2", 1),
        new Token(TokenType.RIGHT_PAREN, ")", 1),
        new Token(TokenType.GOTO, "goto", 1),
        new Token(TokenType.LABEL, "#label", 1),
        new Token(TokenType.COLON, ":", 1),
        new Token(TokenType.EOF, "", 1),
      ];
      const tokenizer = new Tokenizer(code);
      expect(tokenizer.getTokensWithoutWhitespace()).toStrictEqual(expectedTokens);
    });

    it("Should handle newlines", () => {
      const code = "1 \n 2 \n\n 3 \n\n\n\n 4 5 \n 6";
      const expectedTokens = [
        new Token(TokenType.INTEGER, "1", 1),
        new Token(TokenType.INTEGER, "2", 2),
        new Token(TokenType.INTEGER, "3", 4),
        new Token(TokenType.INTEGER, "4", 8),
        new Token(TokenType.INTEGER, "5", 8),
        new Token(TokenType.INTEGER, "6", 9),
        new Token(TokenType.EOF, "", 9),
      ];
      const tokenizer = new Tokenizer(code);
      expect(tokenizer.getTokensWithoutWhitespace()).toStrictEqual(expectedTokens);
    });

    it("Should treat comments as whitespace", () => {
      const code = "1 ;this is a number 2 \n 3 ; this is another number";
      const expectedTokens = [
        new Token(TokenType.INTEGER, "1", 1),
        new Token(TokenType.INTEGER, "3", 2),
        new Token(TokenType.EOF, "", 2),
      ];
      const tokenizer = new Tokenizer(code);
      expect(tokenizer.getTokensWithoutWhitespace()).toStrictEqual(expectedTokens);
    });

    it("Should tokenize without whitespace", () => {
      const code = "if(1+2>3)";
      const expectedTokens = [
        new Token(TokenType.IF, "if", 1),
        new Token(TokenType.LEFT_PAREN, "(", 1),
        new Token(TokenType.INTEGER, "1", 1),
        new Token(TokenType.PLUS, "+", 1),
        new Token(TokenType.INTEGER, "2", 1),
        new Token(TokenType.GREATER, ">", 1),
        new Token(TokenType.INTEGER, "3", 1),
        new Token(TokenType.RIGHT_PAREN, ")", 1),
        new Token(TokenType.EOF, "", 1),
      ];
      const tokenizer = new Tokenizer(code);
      expect(tokenizer.getTokensWithoutWhitespace()).toStrictEqual(expectedTokens);
    });

    it("Should tokenize whitespace", () => {
      const code = "1 2\t3\n4\r\n5 ;comment\n6";
      const expectedTokens = [
        new Token(TokenType.INTEGER, "1", 1),
        new Token(TokenType.SPACE, " ", 1),
        new Token(TokenType.INTEGER, "2", 1),
        new Token(TokenType.TAB, "\t", 1),
        new Token(TokenType.INTEGER, "3", 1),
        new Token(TokenType.NEW_LINE, "\n", 1),
        new Token(TokenType.INTEGER, "4", 2),
        new Token(TokenType.CARRIAGE_RETURN, "\r", 2),
        new Token(TokenType.NEW_LINE, "\n", 2),
        new Token(TokenType.INTEGER, "5", 3),
        new Token(TokenType.SPACE, " ", 3),
        new Token(TokenType.COMMENT, ";comment", 3),
        new Token(TokenType.NEW_LINE, "\n", 3),
        new Token(TokenType.INTEGER, "6", 4),
        new Token(TokenType.EOF, "", 4),
      ];
      const tokenizer = new Tokenizer(code);
      expect(tokenizer.getTokens()).toStrictEqual(expectedTokens);
    });

    it("Should tokenize unterminated string", () => {
      const code = '"string';
      const expectedTokens = [
        new Token(TokenType.STRING, '"string', 1),
        new Token(TokenType.EOF, "", 1),
      ];
      const tokenizer = new Tokenizer(code);
      expect(tokenizer.getTokensWithoutWhitespace()).toStrictEqual(expectedTokens);
    });
  });
});
