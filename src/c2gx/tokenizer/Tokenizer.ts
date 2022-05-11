import Token from "./Token";
import TokenType from "./TokenType";

class Tokenizer {
  private code: string;
  private tokens: Token[];
  private start: number;
  private current: number;
  private line: number;

  private KEYWORD_TO_TYPE: { [key: string]: TokenType } = {
    game: TokenType.GAME,
    map: TokenType.MAP,
    music: TokenType.MUSIC,
    script: TokenType.SCRIPT,
    if: TokenType.IF,
    elseif: TokenType.ELSEIF,
    else: TokenType.ELSE,
    end: TokenType.END,
    while: TokenType.WHILE,
    for: TokenType.FOR,
    from: TokenType.FROM,
    to: TokenType.TO,
    by: TokenType.BY,
    goto: TokenType.GOTO,
  };

  constructor(code: string) {
    this.code = code;
    this.tokens = [];
    this.start = 0;
    this.current = 0;
    this.line = 1;
    this.tokenize();
  }

  getTokens(): Token[] {
    return [...this.tokens];
  }

  getTokensWithoutWhitespace(): Token[] {
    return this.getTokens().filter(
      (t) =>
        ![
          TokenType.SPACE,
          TokenType.TAB,
          TokenType.NEW_LINE,
          TokenType.CARRIAGE_RETURN,
          TokenType.COMMENT,
        ].includes(t.type)
    );
  }

  private tokenize(): void {
    while (!this.isEnd()) {
      this.start = this.current;
      this.getNextToken();
    }
    this.start = this.current;
    this.addToken(TokenType.EOF);
  }

  private getNextToken(): void {
    const nextChar = this.getNextChar();
    switch (nextChar) {
      case "=":
        this.processEqual();
        break;
      case "!":
        this.processNot();
        break;
      case "<":
        this.processLess();
        break;
      case ">":
        this.processGreater();
        break;
      case "&":
        this.processAnd();
        break;
      case "|":
        this.processOr();
        break;
      case "^":
        this.processXor();
        break;
      case "%":
        this.processMod();
        break;
      case "+":
        this.processPlus();
        break;
      case "-":
        this.processMinus();
        break;
      case "*":
        this.processTimes();
        break;
      case "/":
        this.processDivide();
        break;
      case "(":
        this.processLeftParen();
        break;
      case ")":
        this.processRightParen();
        break;
      case '"':
        this.processString();
        break;
      case ":":
        this.processColon();
        break;
      case "#":
        this.processLabel();
        break;
      case ";":
        this.processComment();
        break;
      case " ":
        this.processSpace();
        break;
      case "\t":
        this.processTab();
        break;
      case "\n":
        this.processNewline();
        break;
      case "\r":
        this.processCarriageReturn();
        break;
      default:
        this.processOther(nextChar);
    }
  }

  private processEqual(): void {
    const nextChar = this.getChar();
    if (nextChar === "=") {
      this.getNextChar();
      this.addToken(TokenType.EQUAL_EQUAL);
    } else {
      this.addToken(TokenType.EQUAL);
    }
  }

  private processNot(): void {
    const nextChar = this.getChar();
    if (nextChar === "=") {
      this.getNextChar();
      this.addToken(TokenType.NOT_EQUAL);
    } else {
      this.addToken(TokenType.NOT);
    }
  }

  private processLess(): void {
    const nextChar = this.getChar();
    if (nextChar === "=") {
      this.getNextChar();
      this.addToken(TokenType.LESS_EQUAL);
    } else {
      this.addToken(TokenType.LESS);
    }
  }

  private processGreater(): void {
    const nextChar = this.getChar();
    if (nextChar === "=") {
      this.getNextChar();
      this.addToken(TokenType.GREATER_EQUAL);
    } else {
      this.addToken(TokenType.GREATER);
    }
  }

  private processAnd(): void {
    const nextChar = this.getChar();
    if (nextChar === "&") {
      this.getNextChar();
      this.addToken(TokenType.AND_AND);
    } else if (nextChar === "=") {
      this.getNextChar();
      this.addToken(TokenType.AND_EQUAL);
    } else {
      this.addToken(TokenType.AND);
    }
  }

  private processOr(): void {
    const nextChar = this.getChar();
    if (nextChar === "|") {
      this.getNextChar();
      this.addToken(TokenType.OR_OR);
    } else if (nextChar === "=") {
      this.getNextChar();
      this.addToken(TokenType.OR_EQUAL);
    } else {
      this.addToken(TokenType.OR);
    }
  }

  private processXor(): void {
    const nextChar = this.getChar();
    if (nextChar === "=") {
      this.getNextChar();
      this.addToken(TokenType.XOR_EQUAL);
    } else {
      this.addToken(TokenType.XOR);
    }
  }

  private processMod(): void {
    const nextChar = this.getChar();
    if (nextChar === "=") {
      this.getNextChar();
      this.addToken(TokenType.MOD_EQUAL);
    } else {
      this.addToken(TokenType.MOD);
    }
  }

  private processPlus(): void {
    const nextChar = this.getChar();
    if (nextChar === "=") {
      this.getNextChar();
      this.addToken(TokenType.PLUS_EQUAL);
    } else {
      this.addToken(TokenType.PLUS);
    }
  }

  private processMinus(): void {
    const nextChar = this.getChar();
    if (nextChar === "=") {
      this.getNextChar();
      this.addToken(TokenType.MINUS_EQUAL);
    } else {
      this.addToken(TokenType.MINUS);
    }
  }

  private processTimes(): void {
    const nextChar = this.getChar();
    if (nextChar === "=") {
      this.getNextChar();
      this.addToken(TokenType.TIMES_EQUAL);
    } else {
      this.addToken(TokenType.TIMES);
    }
  }

  private processDivide(): void {
    const nextChar = this.getChar();
    if (nextChar === "=") {
      this.getNextChar();
      this.addToken(TokenType.DIVIDE_EQUAL);
    } else {
      this.addToken(TokenType.DIVIDE);
    }
  }

  private processLeftParen(): void {
    this.addToken(TokenType.LEFT_PAREN);
  }

  private processRightParen(): void {
    this.addToken(TokenType.RIGHT_PAREN);
  }

  private processString(): void {
    while (this.getChar() !== '"' && !this.isEnd()) {
      this.getNextChar();
    }
    this.getNextChar();
    this.addToken(TokenType.STRING);
  }

  private processColon(): void {
    this.addToken(TokenType.COLON);
  }

  private processLabel(): void {
    while (this.isNumberOrLetter(this.getChar())) {
      this.getNextChar();
    }
    this.addToken(TokenType.LABEL);
  }

  private processComment(): void {
    while (this.getChar() !== "\n" && !this.isEnd()) {
      this.getNextChar();
    }
    this.addToken(TokenType.COMMENT);
  }

  private processSpace(): void {
    this.addToken(TokenType.SPACE);
  }

  private processTab(): void {
    this.addToken(TokenType.TAB);
  }

  private processNewline(): void {
    this.addToken(TokenType.NEW_LINE);
    this.line++;
  }

  private processCarriageReturn(): void {
    this.addToken(TokenType.CARRIAGE_RETURN);
  }

  private getNextChar(): string {
    this.current++;
    return this.code[this.current - 1];
  }

  private getChar(): string {
    if (this.isEnd()) {
      return "\0";
    }
    return this.code[this.current];
  }

  private processOther(char: string): void {
    if (this.isNumber(char)) {
      this.processInteger();
    } else if (this.isLetter(char)) {
      this.processIdentifier();
    } else {
      this.addToken(TokenType.OTHER);
    }
  }

  private processInteger(): void {
    while (this.isNumber(this.getChar())) {
      this.getNextChar();
    }
    this.addToken(TokenType.INTEGER);
  }

  private processIdentifier(): void {
    while (this.isNumberOrLetter(this.getChar())) {
      this.getNextChar();
    }
    const lexeme = this.code.substring(this.start, this.current);
    const type = this.KEYWORD_TO_TYPE[lexeme] ?? TokenType.VARIABLE;
    this.addToken(type);
  }

  private isNumber(char: string): boolean {
    return char >= "0" && char <= "9";
  }

  private isLetter(char: string): boolean {
    return (char >= "a" && char <= "z") || (char >= "A" && char <= "Z");
  }

  private isNumberOrLetter(char: string): boolean {
    return this.isNumber(char) || this.isLetter(char);
  }

  private addToken(type: TokenType): void {
    const lexeme = this.code.substring(this.start, this.current);
    this.tokens.push(new Token(type, lexeme, this.line));
  }

  private isEnd(): boolean {
    return this.current >= this.code.length;
  }
}

export default Tokenizer;
