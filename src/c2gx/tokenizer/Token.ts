import TokenType from "./TokenType";

class Token {
  type: TokenType;
  lexeme: string;
  line: number;
  value: number;

  constructor(type: TokenType, lexeme: string, line: number) {
    this.type = type;
    this.lexeme = lexeme;
    this.line = line;
    this.value = Number(lexeme);
  }

  toString(): string {
    return `Token(${this.type}, ${this.lexeme}, ${this.line})`;
  }
}

export default Token;
