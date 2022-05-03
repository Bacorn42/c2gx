import TokenType from "./TokenType";

class Token {
  type: TokenType;
  lexeme: string;
  value: string;
  line: number;

  constructor(type: TokenType, lexeme: string, value: string, line: number) {
    this.type = type;
    this.lexeme = lexeme;
    this.value = value;
    this.line = line;
  }

  toString(): string {
    return `Token(${this.type}, ${this.lexeme}, ${this.value}, ${this.line})`;
  }
}

export default Token;
