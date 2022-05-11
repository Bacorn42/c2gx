import Expression, { AssignExpression, LiteralExpression } from "../parser/Expression";
import Statement, {
  EmptyStatement,
  ExpressionStatement,
  GotoStatement,
  IfStatement,
  LabelStatement,
  MapStatement,
} from "../parser/Statement";
import { LiteralExpressionFactory } from "../parser/testUtil";
import Token from "../tokenizer/Token";
import TokenType from "../tokenizer/TokenType";
import Block, { SimpleBlock } from "./Block";
import gameVariables from "./gameVariables";
import VariableRecord, { VariableRecordMap } from "./VariableRecord";
import VariableState from "./VariableState";

class Graph {
  private blocks: Block[] = [];

  constructor(statements: Statement[]) {
    this.buildGraph(statements);
  }

  private buildGraph(statements: Statement[]): void {
    const labels: { [key: string]: number } = {};
    const edges: [number, number][] = [];

    for (const [i, statement] of statements.entries()) {
      if (statement instanceof LabelStatement) {
        labels[statement.getLabel()] = i;
      }
    }

    for (const [i, statement] of statements.entries()) {
      this.blocks.push(new Block(statement));
      if (statement instanceof GotoStatement) {
        edges.push([i, labels[statement.getLabel()]]);
      } else if (statement instanceof IfStatement) {
        edges.push([i, labels[(statement.getFirstStatement() as GotoStatement).getLabel()]]);
      }

      if (!(statement instanceof GotoStatement) && i !== statements.length - 1) {
        edges.push([i, i + 1]);
      }
    }

    for (const [from, to] of edges) {
      this.blocks[from].successors.push(this.blocks[to]);
      this.blocks[to].predecessors.push(this.blocks[from]);
    }

    const entryBlock = new Block(new EmptyStatement());
    entryBlock.successors.push(this.blocks[0]);
    this.blocks[0].predecessors.push(entryBlock);

    this.blocks.unshift(entryBlock);
  }

  iterativeConstantAnalysis(variables: { [key: string]: [Token, number] }): void {
    this.initializeBlocks(variables);

    let changed = true;
    while (changed) {
      changed = false;
      for (let i = 1; i < this.blocks.length; i++) {
        const block = this.blocks[i];
        block.input = this.meet(block.predecessors);
        [block.output, changed] = this.transfer(block);
      }
    }
  }

  getOutput(): VariableRecordMap {
    return this.blocks[this.blocks.length - 1].output;
  }

  getBlocks(): Block[] {
    return this.blocks;
  }

  getBlocksWithoutEntry(): Block[] {
    return this.blocks.slice(1);
  }

  getSimpleBlocks(): SimpleBlock[] {
    const simpleBlocks: SimpleBlock[] = [];
    for (const block of this.blocks) {
      const successors = block.successors.map((b) => this.blocks.indexOf(b));
      const predecessors = block.predecessors.map((b) => this.blocks.indexOf(b));
      simpleBlocks.push(new SimpleBlock(block.statement, successors, predecessors));
    }
    return simpleBlocks;
  }

  private initializeBlocks(variables: { [key: string]: [Token, number] }): void {
    for (const block of this.blocks) {
      const vars: VariableRecordMap = {};
      for (const variable in variables) {
        vars[variable] = new VariableRecord(
          LiteralExpressionFactory(variable),
          VariableState.UNDEFINED,
          variables[variable][1]
        );
      }
      block.output = vars;
    }
  }

  private meet(predecessors: Block[]): VariableRecordMap {
    const vars: VariableRecordMap = {};
    for (const block of predecessors) {
      if (block.output !== null) {
        for (const [variable, record] of Object.entries(block.output)) {
          if (vars[variable] === undefined) {
            vars[variable] = new VariableRecord(record.value, record.state, record.length);
          } else {
            if (
              vars[variable].state === VariableState.CONSTANT &&
              record.state === VariableState.CONSTANT
            ) {
              if (vars[variable].value.toString() !== record.value.toString()) {
                vars[variable].state = VariableState.POTENTIALLY_RUNTIME;
              }
            } else {
              vars[variable].state = Math.max(vars[variable].state, record.state);
            }
          }
        }
      }
    }
    return vars;
  }

  private transfer(block: Block): [VariableRecordMap, boolean] {
    let changed = false;
    const vars: VariableRecordMap = {};
    for (const [variable, record] of Object.entries(block.input)) {
      vars[variable] = new VariableRecord(record.value, record.state, record.length);
    }
    const statement = block.statement;
    if (statement instanceof MapStatement) {
      this.transferMap(vars);
    } else if (statement instanceof ExpressionStatement) {
      this.transferExpression(vars, statement);
    } else if (statement instanceof IfStatement) {
      this.transferIf(vars, statement);
    }

    for (const [variable, record] of Object.entries(block.output)) {
      if (
        vars[variable]?.value.toString() !== record.value.toString() ||
        vars[variable]?.state !== record.state
      ) {
        changed = true;
      }
    }
    return [vars, changed];
  }

  // After a map statement, game variables may be changed, therefore
  // all variables that directly use game variables are potentially runtime
  private transferMap(vars: VariableRecordMap): void {
    for (const [variable, record] of Object.entries(vars)) {
      const usedVariables = this.getUsedVariables(record.value, vars);
      if ([...usedVariables].filter((v) => gameVariables.includes(v)).length > 0) {
        if (record.state === VariableState.UNDEFINED || record.state === VariableState.CONSTANT) {
          vars[variable].state = VariableState.POTENTIALLY_RUNTIME;
        }
      }
    }
  }

  // Usage of a potentially runtime variable in an assignment causes it to become runtime,
  // Assignment is generally constant, except in the case of assigning to self if it's at least
  // potentially runtime, e.g. var1 = var1 + 1
  private transferExpression(vars: VariableRecordMap, statement: ExpressionStatement): void {
    const expr = statement.getExpr();
    if (expr instanceof AssignExpression) {
      const usedVariables = this.getUsedVariables(expr.exprRight, vars);
      for (const variable of usedVariables) {
        if (!gameVariables.includes(variable)) {
          if (vars[variable].state === VariableState.POTENTIALLY_RUNTIME) {
            vars[variable].state = VariableState.RUNTIME;
          }
        }
      }
      let newState = VariableState.CONSTANT;
      if (usedVariables.has(expr.variable.lexeme)) {
        if (vars[expr.variable.lexeme].state >= VariableState.POTENTIALLY_RUNTIME) {
          newState = VariableState.RUNTIME;
        }
      }

      vars[expr.variable.lexeme] = new VariableRecord(
        expr.exprRight,
        newState,
        vars[expr.variable.lexeme].length
      );
    }
  }

  // Usage of potentially runtime variables in conditions causes them to become runtime
  private transferIf(vars: VariableRecordMap, statement: IfStatement): void {
    const usedVariables = this.getUsedVariables(statement.getFirstCondition(), vars);
    for (const variable of usedVariables) {
      if (!gameVariables.includes(variable)) {
        if (vars[variable]?.state === VariableState.POTENTIALLY_RUNTIME) {
          vars[variable].state = VariableState.RUNTIME;
        }
      }
    }
  }

  private getUsedVariables(expr: Expression, vars: VariableRecordMap): Set<string> {
    const usedVariables = new Set<string>();

    const getExpressionVariables = (expr: Expression): void => {
      if (expr instanceof LiteralExpression) {
        if (expr.token.type === TokenType.VARIABLE) {
          usedVariables.add(expr.token.lexeme);
        }
      }
    };

    expr.traverse(getExpressionVariables);
    const gameVariablesInExpression = new Set(
      [...usedVariables].filter((v) => gameVariables.includes(v))
    );
    let lastSize = 0;
    while (usedVariables.size > lastSize) {
      lastSize = usedVariables.size;
      const variables = [...usedVariables];
      for (const variable of variables) {
        if (!gameVariables.includes(variable)) {
          vars[variable]?.value.traverse(getExpressionVariables);
        } else if (!gameVariablesInExpression.has(variable)) {
          usedVariables.delete(variable);
        }
      }
    }

    return usedVariables;
  }
}

export default Graph;
