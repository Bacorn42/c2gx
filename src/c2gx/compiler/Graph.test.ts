import If from "../parser/If";
import Parser from "../parser/Parser";
import Statement, {
  EmptyStatement,
  GotoStatement,
  IfStatement,
  LabelStatement,
} from "../parser/Statement";
import { BinaryExpressionFactory, ExpressionStatementFactory } from "../parser/testUtil";
import Token from "../tokenizer/Token";
import TokenType from "../tokenizer/TokenType";
import Block, { SimpleBlock } from "./Block";
import Graph from "./Graph";

const parse = (code: string): Statement[] => {
  return new Parser(code).getStatements();
};

const getGraph = (code: string): Graph => {
  return new Graph(parse(code));
};

const createGraph = (edges: [number, number][], statements: Statement[]) => {
  const blocks: Block[] = [];
  for (const statement of statements) {
    blocks.push(new Block(statement));
  }
  for (const [from, to] of edges) {
    blocks[from].successors.push(blocks[to]);
    blocks[to].predecessors.push(blocks[from]);
  }
  return blocks;
};

describe("Graph", () => {
  describe("Construction", () => {
    it("Should build linear graph", () => {
      const code = "1 2 3 4";
      const expectedSimpleBlocks = [
        new SimpleBlock(new EmptyStatement(), [1], []),
        new SimpleBlock(ExpressionStatementFactory(1), [2], [0]),
        new SimpleBlock(ExpressionStatementFactory(2), [3], [1]),
        new SimpleBlock(ExpressionStatementFactory(3), [4], [2]),
        new SimpleBlock(ExpressionStatementFactory(4), [], [3]),
      ];
      expect(getGraph(code).getSimpleBlocks()).toStrictEqual(expectedSimpleBlocks);
    });

    it("Should handle goto", () => {
      const code = "1 #start 2 goto #start";
      const expectedSimpleBlocks = [
        new SimpleBlock(new EmptyStatement(), [1], []),
        new SimpleBlock(ExpressionStatementFactory(1), [2], [0]),
        new SimpleBlock(new LabelStatement("#start"), [3], [1, 4]),
        new SimpleBlock(ExpressionStatementFactory(2), [4], [2]),
        new SimpleBlock(new GotoStatement(new LabelStatement("#start")), [2], [3]),
      ];
      expect(getGraph(code).getSimpleBlocks()).toStrictEqual(expectedSimpleBlocks);
    });

    it("Should handle simple if statements", () => {
      const code = "1 #start 2 if 1 == 1 goto #start end 3";
      const expectedSimpleBlocks = [
        new SimpleBlock(new EmptyStatement(), [1], []),
        new SimpleBlock(ExpressionStatementFactory(1), [2], [0]),
        new SimpleBlock(new LabelStatement("#start"), [3], [1, 4]),
        new SimpleBlock(ExpressionStatementFactory(2), [4], [2]),
        new SimpleBlock(
          new IfStatement(
            [
              new If(BinaryExpressionFactory(1, new Token(TokenType.EQUAL_EQUAL, "==", 1), 1, 1), [
                new GotoStatement(new LabelStatement("#start")),
              ]),
            ],
            [],
            0
          ),
          [2, 5],
          [3]
        ),
        new SimpleBlock(ExpressionStatementFactory(3), [], [4]),
      ];
      expect(getGraph(code).getSimpleBlocks()).toStrictEqual(expectedSimpleBlocks);
    });
  });
});
