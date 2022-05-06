import If from "../parser/If";
import Parser from "../parser/Parser";
import Statement, {
  EmptyStatement,
  GotoStatement,
  IfStatement,
  LabelStatement,
} from "../parser/Statement";
import {
  BinaryExpressionFactory,
  ExpressionStatementFactory,
  LiteralExpressionFactory,
} from "../parser/testUtil";
import Token from "../tokenizer/Token";
import TokenType from "../tokenizer/TokenType";
import Block, { SimpleBlock } from "./Block";
import Graph from "./Graph";
import VariableRecord from "./VariableRecord";
import VariableState from "./VariableState";

const parse = (code: string): Statement[] => {
  return new Parser(code).getStatements();
};

const getGraph = (code: string): Graph => {
  return new Graph(parse(code));
};

const getVariables = (code: string): { [key: string]: Token } => {
  return new Parser(code).getVariables();
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
      const code = "1 #start 2 if var == 1 goto #start end 3";
      const expectedSimpleBlocks = [
        new SimpleBlock(new EmptyStatement(), [1], []),
        new SimpleBlock(ExpressionStatementFactory(1), [2], [0]),
        new SimpleBlock(new LabelStatement("#start"), [3], [1, 4]),
        new SimpleBlock(ExpressionStatementFactory(2), [4], [2]),
        new SimpleBlock(
          new IfStatement(
            [
              new If(
                BinaryExpressionFactory("var", new Token(TokenType.EQUAL_EQUAL, "==", 1), 1, 1),
                [new GotoStatement(new LabelStatement("#start"))]
              ),
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

  describe("Iterative Constant Analysis", () => {
    it("Should detect literal constants", () => {
      const code = "var1 = 2    var2 = 3";
      const expectedValue = {
        var1: new VariableRecord(LiteralExpressionFactory(2), VariableState.CONSTANT),
        var2: new VariableRecord(LiteralExpressionFactory(3), VariableState.CONSTANT),
      };
      const graph = getGraph(code);
      graph.iterativeConstantAnalysis(getVariables(code));
      expect(graph.getOutput()).toStrictEqual(expectedValue);
    });

    it("Should not detect game variables as user variables", () => {
      const code = "var1 = 1    var2 = level";
      const expectedValue = {
        var1: new VariableRecord(LiteralExpressionFactory(1), VariableState.CONSTANT),
        var2: new VariableRecord(LiteralExpressionFactory("level"), VariableState.CONSTANT),
      };
      const graph = getGraph(code);
      graph.iterativeConstantAnalysis(getVariables(code));
      expect(graph.getOutput()).toStrictEqual(expectedValue);
    });

    it("Should detect potentially runtime variables after a map statement", () => {
      const code = 'var1 = 1    var2 = level    map "level.c2m"';
      const expectedValue = {
        var1: new VariableRecord(LiteralExpressionFactory(1), VariableState.CONSTANT),
        var2: new VariableRecord(
          LiteralExpressionFactory("level"),
          VariableState.POTENTIALLY_RUNTIME
        ),
      };
      const graph = getGraph(code);
      graph.iterativeConstantAnalysis(getVariables(code));
      expect(graph.getOutput()).toStrictEqual(expectedValue);
    });

    it("Shouldn't consider indirect game variables as runtime", () => {
      const code = 'var1 = level    var2 = var1    var3 = var2    map "level.c2m"';
      const expectedValue = {
        var1: new VariableRecord(
          LiteralExpressionFactory("level"),
          VariableState.POTENTIALLY_RUNTIME
        ),
        var2: new VariableRecord(LiteralExpressionFactory("var1"), VariableState.CONSTANT),
        var3: new VariableRecord(LiteralExpressionFactory("var2"), VariableState.CONSTANT),
      };
      const graph = getGraph(code);
      graph.iterativeConstantAnalysis(getVariables(code));
      expect(graph.getOutput()).toStrictEqual(expectedValue);
    });

    it("Should detect usage of potentially runtime variable as runtime", () => {
      const code = 'var1 = level    map "level.c2m"    var2 = var1';
      const expectedValue = {
        var1: new VariableRecord(LiteralExpressionFactory("level"), VariableState.RUNTIME),
        var2: new VariableRecord(LiteralExpressionFactory("var1"), VariableState.CONSTANT),
      };
      const graph = getGraph(code);
      graph.iterativeConstantAnalysis(getVariables(code));
      expect(graph.getOutput()).toStrictEqual(expectedValue);
    });

    it("Should detect assigning to self as runtime if it's potentially runtime", () => {
      const code = 'var1 = level    map "level.c2m"    var1 = var1 + 1';
      const expectedValue = {
        var1: new VariableRecord(
          BinaryExpressionFactory("var1", new Token(TokenType.PLUS, "+", 1), 1),
          VariableState.RUNTIME
        ),
      };
      const graph = getGraph(code);
      graph.iterativeConstantAnalysis(getVariables(code));
      expect(graph.getOutput()).toStrictEqual(expectedValue);
    });

    it("Should detect assigning to self as constant if it's constant", () => {
      const code = "var1 = 1    var1 = var1 + 1";
      const expectedValue = {
        var1: new VariableRecord(
          BinaryExpressionFactory("var1", new Token(TokenType.PLUS, "+", 1), 1),
          VariableState.CONSTANT
        ),
      };
      const graph = getGraph(code);
      graph.iterativeConstantAnalysis(getVariables(code));
      expect(graph.getOutput()).toStrictEqual(expectedValue);
    });

    it("Should detect runtime variable in loop when meet detects different values", () => {
      const code = "var1 = 1  #start  var1 = var1 + 1  if var1 < 5 goto #start end  1";
      const expectedValue = {
        var1: new VariableRecord(
          BinaryExpressionFactory("var1", new Token(TokenType.PLUS, "+", 1), 1),
          VariableState.RUNTIME
        ),
      };
      const graph = getGraph(code);
      graph.iterativeConstantAnalysis(getVariables(code));
      expect(graph.getOutput()).toStrictEqual(expectedValue);
    });

    it("Should detect potentially runtime variable in if condition as runtime", () => {
      const code = 'var1 = level  map "level.c2m"  #start  if var1 == 1 goto #start end';
      const expectedValue = {
        var1: new VariableRecord(LiteralExpressionFactory("level"), VariableState.RUNTIME),
      };
      const graph = getGraph(code);
      graph.iterativeConstantAnalysis(getVariables(code));
      expect(graph.getOutput()).toStrictEqual(expectedValue);
    });
  });
});
