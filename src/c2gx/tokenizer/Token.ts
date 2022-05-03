import TokenType from "./TokenType";

class Token {
  type: TokenType;
  lexeme: string;
  line: number;

  constructor(type: TokenType, lexeme: string, line: number) {
    this.type = type;
    this.lexeme = lexeme;
    this.line = line;
  }

  toString(): string {
    return `Token(${this.type}, ${this.lexeme}, ${this.line})`;
  }
}

export default Token;
