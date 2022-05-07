import Compiler from "./Compiler";
import CompilerOptions from "./CompilerOptions";

describe("Compiler", () => {
  describe("Basic compilation", () => {
    it("Should compile basic expression", () => {
      const code = "1    var1 = 2";
      const expectedValue = "1\nvar1 = 2";
      const options: CompilerOptions = {
        noVariableReplacement: true,
        noUselessExpressionRemoval: true,
      };
      expect(new Compiler(code, options).compile()).toMatch(expectedValue);
    });

    it("Should evaluate basic expression", () => {
      const code = "2 * (3 + 4) - 1    12 / 4    14 / 4    14 % 4";
      const expectedValue = "13\n3\n3\n2";
      const options: CompilerOptions = { noUselessExpressionRemoval: true };
      expect(new Compiler(code, options).compile()).toMatch(expectedValue);
    });

    it("Should evaluate bitwise operations", () => {
      const code = "22 & 12   22 | 12    22 ^ 12";
      const expectedValue = "4\n30\n26";
      const options: CompilerOptions = { noUselessExpressionRemoval: true };
      expect(new Compiler(code, options).compile()).toMatch(expectedValue);
    });

    it("Should evaluate comparison expressions", () => {
      const code = "1 < 2    2 <= 2    3 > 4    5 >= 8";
      const expectedValue = "1\n1\n0\n0";
      const options: CompilerOptions = { noUselessExpressionRemoval: true };
      expect(new Compiler(code, options).compile()).toMatch(expectedValue);
    });

    it("Should evaluate boolean expressions", () => {
      const code = "1 && 0    1 && 1 && 1     0 || 1 || 0    0 || 0";
      const expectedValue = "0\n1\n1\n0";
      const options: CompilerOptions = { noUselessExpressionRemoval: true };
      expect(new Compiler(code, options).compile()).toMatch(expectedValue);
    });

    it("Should compile game statement", () => {
      const code = 'game "Levelset"';
      const expectedValue = 'game "Levelset"';
      const options: CompilerOptions = { noUselessExpressionRemoval: true };
      expect(new Compiler(code, options).compile()).toMatch(expectedValue);
    });

    it("Should compile map statement", () => {
      const code = 'map "level.c2m"';
      const expectedValue = 'map "level.c2m"';
      const options: CompilerOptions = { noUselessExpressionRemoval: true };
      expect(new Compiler(code, options).compile()).toMatch(expectedValue);
    });

    it("Should compile music statement", () => {
      const code = 'music "song.mp3"';
      const expectedValue = 'music "song.mp3"';
      const options: CompilerOptions = { noUselessExpressionRemoval: true };
      expect(new Compiler(code, options).compile()).toMatch(expectedValue);
    });

    it("Should compile script statement", () => {
      const code = 'script "some text" "some more text" "even more text"';
      const expectedValue = 'script\n"some text"\n"some more text"\n"even more text"';
      const options: CompilerOptions = { noUselessExpressionRemoval: true };
      expect(new Compiler(code, options).compile()).toMatch(expectedValue);
    });

    it("Should compile complete if statement", () => {
      const code = "if var1 == 1 1 elseif var1 == 2 2 3 elseif var1 == 3 4 else 5 end";
      const expectedValue =
        "if var1 == 1 goto #if0x0 end" +
        "\nif var1 == 2 goto #if0x1 end" +
        "\nif var1 == 3 goto #if0x2 end" +
        "\ngoto #else0" +
        "\n#if0x0" +
        "\n1" +
        "\ngoto #endif0" +
        "\n#if0x1" +
        "\n2" +
        "\n3" +
        "\ngoto #endif0" +
        "\n#if0x2" +
        "\n4" +
        "\ngoto #endif0" +
        "\n#else0" +
        "\n5" +
        "\n#endif0";

      const options: CompilerOptions = { noUselessExpressionRemoval: true };
      expect(new Compiler(code, options).compile()).toMatch(expectedValue);
    });

    it("Should compile if statement without else", () => {
      const code = "if var1 == 1 1 elseif var1 == 2 2 3 elseif var1 == 3 4 end";
      const expectedValue =
        "if var1 == 1 goto #if0x0 end" +
        "\nif var1 == 2 goto #if0x1 end" +
        "\nif var1 == 3 goto #if0x2 end" +
        "\ngoto #else0" +
        "\n#if0x0" +
        "\n1" +
        "\ngoto #endif0" +
        "\n#if0x1" +
        "\n2" +
        "\n3" +
        "\ngoto #endif0" +
        "\n#if0x2" +
        "\n4" +
        "\ngoto #endif0" +
        "\n#else0" +
        "\n#endif0";

      const options: CompilerOptions = { noUselessExpressionRemoval: true };
      expect(new Compiler(code, options).compile()).toMatch(expectedValue);
    });

    it("Should compile while statement", () => {
      const code = "while var1 == 1 1 2 end";
      const expectedValue =
        "#while0" +
        "\nif var1 == 1 goto #whileloop0 end" +
        "\ngoto #endwhile0" +
        "\n#whileloop0" +
        "\n1" +
        "\n2" +
        "\ngoto #while0" +
        "\n#endwhile0";

      const options: CompilerOptions = { noUselessExpressionRemoval: true };
      expect(new Compiler(code, options).compile()).toMatch(expectedValue);
    });

    it("Should compile for statement", () => {
      const code = "for i from 1 to 5 by 2 1 2 end";
      const expectedValue =
        "i = 1" +
        "\n#for0" +
        "\nif i < 5 goto #forloop0 end" +
        "\ngoto #endfor0" +
        "\n#forloop0" +
        "\n1" +
        "\n2" +
        "\ni = i + 2" +
        "\ngoto #for0" +
        "\n#endfor0";

      const options: CompilerOptions = {
        noUselessExpressionRemoval: true,
        noVariableReplacement: true,
      };
      expect(new Compiler(code, options).compile()).toMatch(expectedValue);
    });

    it("Should compile goto statement", () => {
      const code = "#start 1 goto #start";
      const expectedValue = "#start\n1\ngoto #start";
      const options: CompilerOptions = { noUselessExpressionRemoval: true };
      expect(new Compiler(code, options).compile()).toMatch(expectedValue);
    });
  });

  describe("Optimization", () => {
    it("Should remove unreachable if statement", () => {
      const code = "if 1 > 2 3 end";
      const expectedValue = "";
      const options: CompilerOptions = { noUselessExpressionRemoval: true };
      expect(new Compiler(code, options).compile()).toMatch(expectedValue);
    });

    it("Should remove unreachable elseif", () => {
      const code = "if var1 == 1 1 elseif 1 > 2 2 else 3 end";
      const expectedValue =
        "if var1 == 1 goto #if0x0 end" +
        "\ngoto #else0" +
        "\n#if0x0" +
        "\n1" +
        "\ngoto #endif0" +
        "\n#else0" +
        "\n3" +
        "\n#endif0";

      const options: CompilerOptions = { noUselessExpressionRemoval: true };
      expect(new Compiler(code, options).compile()).toMatch(expectedValue);
    });

    it("Should always evaluate true if", () => {
      const code = "if 1 < 2 1 2 elseif var1 == 1 3 4 else 5 6 end";
      const expectedValue = "1\n2";
      const options: CompilerOptions = { noUselessExpressionRemoval: true };
      expect(new Compiler(code, options).compile()).toMatch(expectedValue);
    });

    it("Should remove all elseifs after the one that's always true", () => {
      const code = "if var1 == 1 1 2 elseif 1 < 2 3 4 elseif var1 == 2 5 6 else 7 8 end";
      const expectedValue =
        "if var1 == 1 goto #if0x0 end" +
        "\ngoto #if0x1" +
        "\n#if0x0" +
        "\n1" +
        "\n2" +
        "\ngoto #endif0" +
        "\n#if0x1" +
        "\n3" +
        "\n4" +
        "\n#endif";

      const options: CompilerOptions = { noUselessExpressionRemoval: true };
      expect(new Compiler(code, options).compile()).toMatch(expectedValue);
    });

    it("Should remove unreachable code", () => {
      const code = "#start 1 2 goto #start 3 4";
      const expectedValue = "#start\n1\n2\ngoto #start";
      const unexpectedValue = "3\n4";
      const options: CompilerOptions = { noUselessExpressionRemoval: true };
      expect(new Compiler(code, options).compile()).toMatch(expectedValue);
      expect(new Compiler(code, options).compile()).not.toMatch(unexpectedValue);
    });

    it("Should remove unreachable code in the middle", () => {
      const code = "1 2 goto #start 3 4 #start 5 6";
      const expectedValue = "1\n2\n5\n6";
      const options: CompilerOptions = { noUselessExpressionRemoval: true };
      expect(new Compiler(code, options).compile()).toMatch(expectedValue);
    });

    it("Should remove empty loops", () => {
      const code = "1 2 #start goto #start 3 4";
      const expectedValue = "1\n2";
      const unexpectedValue1 = "3\n4";
      const unexpectedValue2 = "#start";
      const options: CompilerOptions = { noUselessExpressionRemoval: true };
      expect(new Compiler(code, options).compile()).toMatch(expectedValue);
      expect(new Compiler(code, options).compile()).not.toMatch(unexpectedValue1);
      expect(new Compiler(code, options).compile()).not.toMatch(unexpectedValue2);
    });

    it("Should remove useless expressions", () => {
      const code = "1  2+3*4-5  var1 = 5  var2 = 6*7-8+9";
      const expectedValue = "";
      expect(new Compiler(code).compile()).toStrictEqual(expectedValue);
    });

    it("Should remove useless expressions from within if statements", () => {
      const code = "if var1 == 1 1 elseif var1 == 2 2 3 else 4 end";
      const expectedValue =
        "if var1 == 1 goto #if0x0 end" +
        "\nif var1 == 2 goto #if0x1 end" +
        "\ngoto #else0" +
        "\n#if0x0" +
        "\ngoto #endif0" +
        "\n#if0x1" +
        "\ngoto #endif0" +
        "\n#else0" +
        "\n#endif0";

      expect(new Compiler(code).compile()).toMatch(expectedValue);
    });

    it("Should remove a useless infinite loop", () => {
      const code = "while 1 < 2 1 2 end";
      const expectedValue = "";
      expect(new Compiler(code).compile()).toStrictEqual(expectedValue);
    });

    it("Should remove constant and potentially runtime variables", () => {
      const code = 'var1 = 1  var2 = var1 + 2 * 3  var3 = level  map "level.c2m"  var4 = var2 / 3';
      const expectedValue = 'map "level.c2m"';
      expect(new Compiler(code).compile()).toMatch(expectedValue);
    });

    it("Should not remove runtime variables", () => {
      const code = 'var1 = level  var2 = var1 + 1  map "level.c2m"  var3 = var1 + 5';
      const expectedValue = 'var1 = level\nmap "level.c2m"';
      const options: CompilerOptions = { noRuntimeVariableReplacement: true };
      expect(new Compiler(code, options).compile()).toMatch(expectedValue);
    });

    it("Should not remove runtime variables through indirect usage", () => {
      const code = 'var1 = level  var2 = var1 + 1  map "level.c2m"  var3 = var2 + 5';
      const expectedValue = 'var1 = level\nmap "level.c2m"';
      const unexpectedValue = "var3";
      const options: CompilerOptions = { noRuntimeVariableReplacement: true };
      expect(new Compiler(code, options).compile()).toMatch(expectedValue);
      expect(new Compiler(code, options).compile()).not.toMatch(unexpectedValue);
    });

    it("Should replace constant variables with their value", () => {
      const code = 'var1 = level  var2 = 5  map "level.c2m"  var1 = var1 + var2';
      const expectedValue = 'var1 = level\nmap "level.c2m"\nvar1 = var1 + 5';
      const options: CompilerOptions = { noRuntimeVariableReplacement: true };
      expect(new Compiler(code, options).compile()).toMatch(expectedValue);
    });

    it("Should replace constant variables with their value even through indirection", () => {
      const code = 'var1 = level   var2 = 5  var3 = var2 * 2  map "level.c2m"  var1 = var1 + var3';
      const expectedValue = 'var1 = level\nmap "level.c2m"\nvar1 = var1 + 10';
      const options: CompilerOptions = { noRuntimeVariableReplacement: true };
      expect(new Compiler(code, options).compile()).toMatch(expectedValue);
    });

    it("Should replace runtime variables", () => {
      const code = 'var1 = level   var2 = 5  var3 = var2 * 2  map "level.c2m"  var1 = var1 + var3';
      const expectedValue = 'reg1 = reg1 | level\nmap "level.c2m"\nreg1 = reg1 | reg1 + 10';
      expect(new Compiler(code).compile()).toMatch(expectedValue);
    });

    it("Should replace runtime variables with nondefault length", () => {
      const code = 'var1 : 4 = level    map "level.c2m"    var2 = var1';
      const expectedValue = 'reg1 = reg1 | level % 16 * 268435456\nmap "level.c2m"';
      expect(new Compiler(code).compile()).toMatch(expectedValue);
    });

    it("Should replace runtime variables with nondefault start", () => {
      const code = 'var1 : 4 = level    var2 : 4 = level    map "level.c2m"    var3 = var1 + var2';
      const expectedValue =
        'reg1 = reg1 | level % 16 * 268435456\nreg1 = reg1 | level % 16 * 16777216\nmap "level.c2m"';
      expect(new Compiler(code).compile()).toMatch(expectedValue);
    });

    it("Should replace runtime variables with nondefault params on both sides of assignment", () => {
      const code =
        'var1 : 4 = level    var2 : 4 = var2 + level    map "level.c2m"    var3 = var1 + var2';
      const expectedValue =
        'reg1 = reg1 | level % 16 * 268435456\nreg1 = reg1 | reg1 & 251658240 * 16 / 268435456 + level % 16 * 16777216\nmap "level.c2m"';
      expect(new Compiler(code).compile()).toMatch(expectedValue);
    });
  });
});
