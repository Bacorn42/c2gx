import Compiler from "./Compiler";

describe("Compiler", () => {
  describe("Basic compilation", () => {
    it("Should compile basic expression", () => {
      const code = "1    var1 = 2";
      const expectedValue = "1\nvar1 = 2";
      expect(new Compiler(code).compile()).toMatch(expectedValue);
    });

    it("Should evaluate basic expression", () => {
      const code = "2 * (3 + 4) - 1    12 / 4    14 / 4    14 % 4";
      const expectedValue = "13\n3\n3\n2";
      expect(new Compiler(code).compile()).toMatch(expectedValue);
    });

    it("Should evaluate bitwise operations", () => {
      const code = "22 & 12   22 | 12    22 ^ 12";
      const expectedValue = "4\n30\n26";
      expect(new Compiler(code).compile()).toMatch(expectedValue);
    });

    it("Should evaluate comparison expressions", () => {
      const code = "1 < 2    2 <= 2    3 > 4    5 >= 8";
      const expectedValue = "1\n1\n0\n0";
      expect(new Compiler(code).compile()).toMatch(expectedValue);
    });

    it("Should evaluate boolean expressions", () => {
      const code = "1 && 0    1 && 1 && 1     0 || 1 || 0    0 || 0";
      const expectedValue = "0\n1\n1\n0";
      expect(new Compiler(code).compile()).toMatch(expectedValue);
    });

    it("Should compile game statement", () => {
      const code = 'game "Levelset"';
      const expectedValue = 'game "Levelset"';
      expect(new Compiler(code).compile()).toMatch(expectedValue);
    });

    it("Should compile map statement", () => {
      const code = 'map "level.c2m"';
      const expectedValue = 'map "level.c2m"';
      expect(new Compiler(code).compile()).toMatch(expectedValue);
    });

    it("Should compile music statement", () => {
      const code = 'music "song.mp3"';
      const expectedValue = 'music "song.mp3"';
      expect(new Compiler(code).compile()).toMatch(expectedValue);
    });

    it("Should compile script statement", () => {
      const code = 'script "some text" "some more text" "even more text"';
      const expectedValue = 'script\n"some text"\n"some more text"\n"even more text"';
      expect(new Compiler(code).compile()).toMatch(expectedValue);
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

      expect(new Compiler(code).compile()).toMatch(expectedValue);
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

      expect(new Compiler(code).compile()).toMatch(expectedValue);
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

      expect(new Compiler(code).compile()).toMatch(expectedValue);
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

      expect(new Compiler(code).compile()).toMatch(expectedValue);
    });

    it("Should compile label statement", () => {
      const code = "#start";
      const expectedValue = "#start";
      expect(new Compiler(code).compile()).toMatch(expectedValue);
    });

    it("Should compile goto statement", () => {
      const code = "#start goto #start";
      const expectedValue = "#start\ngoto #start";
      expect(new Compiler(code).compile()).toMatch(expectedValue);
    });
  });
});
