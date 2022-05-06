import Token from "../tokenizer/Token";
import TokenType from "../tokenizer/TokenType";
import If from "./If";
import Statement, {
  GameStatement,
  MapStatement,
  MusicStatment,
  ScriptStatement,
  IfStatement,
  WhileStatement,
  ForStatement,
  LabelStatement,
  GotoStatement,
  ExpressionStatement,
} from "./Statement";
import Expression, {
  AssignExpression,
  BinaryExpression,
  GroupExpression,
  LiteralExpression,
} from "./Expression";
import Tokenizer from "../tokenizer/Tokenizer";
import gameVariables from "../compiler/gameVariables";

class Parser {
  private tokens: Token[];
  private statements: Statement[];
  private current: number;
  private id: number;
  private variables: { [key: string]: Token };

  constructor(code: string) {
    const tokenizer = new Tokenizer(code);
    this.tokens = tokenizer.getTokens();
    this.statements = [];
    this.current = 0;
    this.id = 0;
    this.variables = {};
    this.parse();
  }

  getStatements(): Statement[] {
    return this.statements;
  }

  getVariables(): { [key: string]: Token } {
    return this.variables;
  }

  private parse(): void {
    while (!this.isEnd()) {
      this.statements.push(this.statement());
    }
  }

  private statement(): Statement {
    const nextToken = this.getNextToken();
    switch (nextToken.type) {
      case TokenType.GAME:
        return this.game();
      case TokenType.MAP:
        return this.map();
      case TokenType.MUSIC:
        return this.music();
      case TokenType.SCRIPT:
        return this.script();
      case TokenType.IF:
        return this.if();
      case TokenType.WHILE:
        return this.while();
      case TokenType.FOR:
        return this.for();
      case TokenType.LABEL:
        return this.label();
      case TokenType.GOTO:
        return this.goto();
      default:
        this.current--;
        return this.expressionStatement();
    }
  }

  private game(): GameStatement {
    const setName = this.expect(TokenType.STRING);
    return new GameStatement(setName.lexeme);
  }

  private map(): MapStatement {
    const path = this.expect(TokenType.STRING);
    return new MapStatement(path.lexeme);
  }

  private music(): MusicStatment {
    const path = this.expect(TokenType.STRING);
    return new MusicStatment(path.lexeme);
  }

  private script(): ScriptStatement {
    const scripts: string[] = [];
    while (this.isNextToken(TokenType.STRING)) {
      scripts.push(this.getNextToken().lexeme);
    }
    return new ScriptStatement(scripts);
  }

  private if(): IfStatement {
    const ifs: If[] = [this.getIf()];
    while (this.isNextToken(TokenType.ELSEIF)) {
      this.getNextToken();
      ifs.push(this.getIf());
    }
    if (this.isNextToken(TokenType.ELSE)) {
      this.getNextToken();
      const elsePart = this.getIfStatements();
      this.expect(TokenType.END);
      return new IfStatement(ifs, elsePart, this.id++);
    }
    this.expect(TokenType.END);
    return new IfStatement(ifs, [], this.id++);
  }

  private getIf(): If {
    const condition = this.expression();
    const statements = this.getIfStatements();
    return new If(condition, statements);
  }

  private getIfStatements(): Statement[] {
    const statements: Statement[] = [];
    while (!this.isNextToken(TokenType.ELSEIF, TokenType.ELSE, TokenType.END)) {
      statements.push(this.statement());
    }
    return statements;
  }

  private while(): WhileStatement {
    const condition = this.expression();
    const statements: Statement[] = [];
    while (!this.isNextToken(TokenType.END)) {
      statements.push(this.statement());
    }
    this.expect(TokenType.END);
    return new WhileStatement(condition, statements, this.id++);
  }

  private for(): ForStatement {
    const variable = this.expression();
    this.expect(TokenType.FROM);
    const from = this.expression();
    this.expect(TokenType.TO);
    const to = this.expression();
    this.expect(TokenType.BY);
    const by = this.expression();
    const statements: Statement[] = [];
    while (!this.isNextToken(TokenType.END)) {
      statements.push(this.statement());
    }
    this.expect(TokenType.END);
    return new ForStatement(variable, from, to, by, statements, this.id++);
  }

  private label(): LabelStatement {
    const label = this.getPreviousToken().lexeme;
    return new LabelStatement(label);
  }

  private goto(): GotoStatement {
    const label = this.expect(TokenType.LABEL);
    return new GotoStatement(new LabelStatement(label.lexeme));
  }

  private expressionStatement(): ExpressionStatement {
    return new ExpressionStatement(this.expression());
  }

  private expression(): Expression {
    return this.assignment().evaluate();
  }

  private assignment(): Expression {
    const expr = this.or();
    if (this.isNextToken(TokenType.EQUAL)) {
      const operator = this.getNextToken();
      const exprRight = this.or();
      if (expr instanceof LiteralExpression && expr.token.type === TokenType.VARIABLE) {
        return new AssignExpression(expr.token, operator, exprRight);
      }
      throw Error("Cannot assign to non-variable");
    }
    return expr;
  }

  private or(): Expression {
    let expr = this.and();
    while (this.isNextToken(TokenType.OR_OR)) {
      const operator = this.getNextToken();
      const exprRight = this.and();
      expr = new BinaryExpression(expr, operator, exprRight);
    }
    return expr;
  }

  private and(): Expression {
    let expr = this.bitwiseOr();
    while (this.isNextToken(TokenType.AND_AND)) {
      const operator = this.getNextToken();
      const exprRight = this.bitwiseOr();
      expr = new BinaryExpression(expr, operator, exprRight);
    }
    return expr;
  }

  private bitwiseOr(): Expression {
    let expr = this.bitwiseXor();
    while (this.isNextToken(TokenType.OR)) {
      const operator = this.getNextToken();
      const exprRight = this.bitwiseXor();
      expr = new BinaryExpression(expr, operator, exprRight);
    }
    return expr;
  }

  private bitwiseXor(): Expression {
    let expr = this.bitwiseAnd();
    while (this.isNextToken(TokenType.XOR)) {
      const operator = this.getNextToken();
      const exprRight = this.bitwiseAnd();
      expr = new BinaryExpression(expr, operator, exprRight);
    }
    return expr;
  }

  private bitwiseAnd(): Expression {
    let expr = this.equality();
    while (this.isNextToken(TokenType.AND)) {
      const operator = this.getNextToken();
      const exprRight = this.equality();
      expr = new BinaryExpression(expr, operator, exprRight);
    }
    return expr;
  }

  private equality(): Expression {
    let expr = this.comparison();
    while (this.isNextToken(TokenType.EQUAL_EQUAL, TokenType.NOT_EQUAL)) {
      const operator = this.getNextToken();
      const exprRight = this.comparison();
      expr = new BinaryExpression(expr, operator, exprRight);
    }
    return expr;
  }

  private comparison(): Expression {
    let expr = this.addition();
    while (
      this.isNextToken(
        TokenType.LESS,
        TokenType.LESS_EQUAL,
        TokenType.GREATER,
        TokenType.GREATER_EQUAL
      )
    ) {
      const operator = this.getNextToken();
      const exprRight = this.addition();
      expr = new BinaryExpression(expr, operator, exprRight);
    }
    return expr;
  }

  private addition(): Expression {
    let expr = this.multiplication();
    while (this.isNextToken(TokenType.PLUS, TokenType.MINUS)) {
      const operator = this.getNextToken();
      const exprRight = this.multiplication();
      expr = new BinaryExpression(expr, operator, exprRight);
    }
    return expr;
  }

  private multiplication(): Expression {
    let expr = this.primary();
    while (this.isNextToken(TokenType.TIMES, TokenType.DIVIDE, TokenType.MOD)) {
      const operator = this.getNextToken();
      const exprRight = this.primary();
      expr = new BinaryExpression(expr, operator, exprRight);
    }
    return expr;
  }

  private primary(): Expression {
    const token = this.getNextToken();
    if (token.type === TokenType.VARIABLE) {
      if (!gameVariables.includes(token.lexeme)) {
        this.variables[token.lexeme] = token;
      }
    }
    if (token.type === TokenType.LEFT_PAREN) {
      return this.groupExpression();
    }
    return new LiteralExpression(token);
  }

  private groupExpression(): GroupExpression {
    const expr = this.expression();
    this.expect(TokenType.RIGHT_PAREN);
    return new GroupExpression(expr);
  }

  private getNextToken(): Token {
    if (!this.isEnd()) {
      this.current++;
    }
    return this.tokens[this.current - 1];
  }

  private getToken(): Token {
    return this.tokens[this.current];
  }

  private getPreviousToken(): Token {
    return this.tokens[this.current - 1];
  }

  private expect(type: TokenType): Token {
    if (this.getToken().type !== type) {
      debugger;
      throw Error(`Expected ${TokenType[type]} but got ${TokenType[this.getToken().type]}`);
    }
    return this.getNextToken();
  }

  private isNextToken(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.getToken().type === type) {
        return true;
      }
    }
    return false;
  }

  private isEnd(): boolean {
    return this.getToken().type === TokenType.EOF;
  }
}

export default Parser;
