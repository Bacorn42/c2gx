import Parser from "../parser/Parser";
import Token from "../tokenizer/Token";

class Compiler {
  private code: string;
  private variables: { [key: string]: Token } = {};

  constructor(code: string) {
    this.code = code;
  }

  compile(): string {
    const parser = new Parser(this.code);
    const statements = parser.getStatements();

    let newCode = "";
    for (const statement of statements) {
      newCode += statement.translate();
    }

    const newParser = new Parser(newCode);
    const newStatements = newParser.getStatements();
    this.variables = newParser.getVariables();

    return newCode;
  }
}

export default Compiler;
