import If from "./If";
import Expression from "./Expression";
import { VariableRecordMap } from "../compiler/VariableRecord";

abstract class Statement {
  abstract translate(): string;
  output(): string {
    return this.translate();
  }
  replace(vars: VariableRecordMap, output: VariableRecordMap): void {}
}

class GameStatement extends Statement {
  private setName: string;

  constructor(setName: string) {
    super();
    this.setName = setName;
  }

  translate(): string {
    return `game ${this.setName}\n`;
  }
}

class MapStatement extends Statement {
  private path: string;

  constructor(path: string) {
    super();
    this.path = path;
  }

  translate(): string {
    return `map ${this.path}\n`;
  }
}

class MusicStatment extends Statement {
  private path: string;

  constructor(path: string) {
    super();
    this.path = path;
  }

  translate(): string {
    return `music ${this.path}\n`;
  }
}

class ScriptStatement extends Statement {
  private scripts: string[];

  constructor(scripts: string[]) {
    super();
    this.scripts = scripts;
  }

  translate(): string {
    let output = "script";
    for (const script of this.scripts) {
      output += `\n${script}`;
    }
    return `${output}\n`;
  }
}

class IfStatement extends Statement {
  private ifs: If[];
  private elsePart: Statement[];
  private id: number;

  constructor(ifs: If[], elsePart: Statement[], id: number) {
    super();
    this.ifs = ifs;
    this.elsePart = elsePart;
    this.id = id;
  }

  translate(): string {
    const conditions = this.ifs
      .map((ifPart, i) => `if ${ifPart.condition.translate()} goto #if${this.id}x${i} end`)
      .join("\n");
    const statements = this.ifs
      .map(
        (ifPart, i) =>
          `#if${this.id}x${i}\n${ifPart.statements
            .map((s) => s.translate())
            .join("")}\ngoto #endif${this.id}\n`
      )
      .join("");
    const elseStatments = this.elsePart.map((s) => s.translate()).join("");

    return (
      `${conditions}` +
      `\ngoto #else${this.id}` +
      `\n${statements}` +
      `#else${this.id}` +
      `\n${elseStatments}` +
      `\n#endif${this.id}\n`
    );
  }

  replace(vars: VariableRecordMap, output: VariableRecordMap): void {
    this.ifs[0].condition.replace(vars, output);
  }

  output(): string {
    return `if ${this.ifs[0].condition.translate()} ${this.ifs[0].statements[0]
      .output()
      .trim()} end\n`;
  }

  getFirstStatement(): Statement {
    return this.ifs[0].statements[0];
  }

  getFirstCondition(): Expression {
    return this.ifs[0].condition;
  }
}

class WhileStatement extends Statement {
  private condition: Expression;
  private statements: Statement[];
  private id: number;

  constructor(condition: Expression, statements: Statement[], id: number) {
    super();
    this.condition = condition;
    this.statements = statements;
    this.id = id;
  }

  translate(): string {
    const statements = this.statements.map((s) => s.translate()).join("");
    return (
      `#while${this.id}` +
      `\nif ${this.condition.translate()} goto #whileloop${this.id} end` +
      `\ngoto #endwhile${this.id}` +
      `\n#whileloop${this.id}` +
      `\n${statements}` +
      `\ngoto #while${this.id}` +
      `\n#endwhile${this.id}\n`
    );
  }
}

class ForStatement extends Statement {
  private variable: Expression;
  private from: Expression;
  private to: Expression;
  private by: Expression;
  private statements: Statement[];
  private id: number;

  constructor(
    variable: Expression,
    from: Expression,
    to: Expression,
    by: Expression,
    statements: Statement[],
    id: number
  ) {
    super();
    this.variable = variable;
    this.from = from;
    this.to = to;
    this.by = by;
    this.statements = statements;
    this.id = id;
  }

  translate(): string {
    const statements = this.statements.map((s) => s.translate()).join("");

    return (
      `${this.variable.translate()} = ${this.from.translate()}` +
      `\n#for${this.id}` +
      `\nif ${this.variable.translate()} < ${this.to.translate()} goto #forloop${this.id} end` +
      `\ngoto #endfor${this.id}` +
      `\n#forloop${this.id}` +
      `\n${statements}` +
      `\n${this.variable.translate()} = ${this.variable.translate()} + ${this.by.translate()}` +
      `\ngoto #for${this.id}` +
      `\n#endfor${this.id}\n`
    );
  }
}

class LabelStatement extends Statement {
  private label: string;

  constructor(label: string) {
    super();
    this.label = label;
  }

  translate(): string {
    return `${this.label}\n`;
  }

  getLabel(): string {
    return this.label;
  }
}

class GotoStatement extends Statement {
  private label: LabelStatement;

  constructor(label: LabelStatement) {
    super();
    this.label = label;
  }

  translate(): string {
    return `goto ${this.label.translate()}\n`;
  }

  output(): string {
    return `goto ${this.label.output().trim()}\n`;
  }

  getLabel(): string {
    return this.label.getLabel();
  }
}

class ExpressionStatement extends Statement {
  private expr: Expression;

  constructor(expr: Expression) {
    super();
    this.expr = expr;
  }

  translate(): string {
    return `${this.expr.translate()}\n`;
  }

  replace(vars: VariableRecordMap, output: VariableRecordMap): void {
    this.expr.replace(vars, output);
  }

  getExpr(): Expression {
    return this.expr;
  }
}

class EmptyStatement extends Statement {
  translate(): string {
    return "";
  }
}

export default Statement;

export {
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
  EmptyStatement,
};
