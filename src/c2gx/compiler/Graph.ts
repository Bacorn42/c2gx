import Statement, {
  EmptyStatement,
  GotoStatement,
  IfStatement,
  LabelStatement,
} from "../parser/Statement";
import Block, { SimpleBlock } from "./Block";

class Graph {
  private blocks: Block[] = [];

  constructor(statements: Statement[]) {
    this.buildGraph(statements);
  }

  private buildGraph(statements: Statement[]): void {
    const labels: { [key: string]: number } = {};
    const edges: [number, number][] = [];

    for (const [i, statement] of statements.entries()) {
      this.blocks.push(new Block(statement));
      if (statement instanceof LabelStatement) {
        labels[statement.getLabel()] = i;
      } else if (statement instanceof GotoStatement) {
        edges.push([i, labels[statement.getLabel()]]);
      } else if (statement instanceof IfStatement) {
        edges.push([i, labels[(statement.getFirstStatement() as GotoStatement).getLabel()]]);
      }

      if (!(statement instanceof GotoStatement) && i != statements.length - 1) {
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

  getBlocks(): Block[] {
    return this.blocks;
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
}

export default Graph;
