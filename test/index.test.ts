import chalk from "chalk";
import slice from "../src";

const ESC = "\x1b";

chalk.enabled = true;

describe("suite 1", () => {
  describe("ascii", () => {
    it("ascii", () => {
      expect(slice("a", 0, 1)).toBe("a");
    });

    it("omit end", () => {
      expect(slice("a", 0)).toBe("a");
    });

    it("negative start", () => {
      expect(() => slice("a", -1)).toThrowError();
    });

    it("negative end", () => {
      expect(() => slice("a", 0, -1)).toThrowError();
    });

    it("end position", () => {
      expect(slice("The morning is upon us.", 1, 8)).toBe("he morn");
    });

    it("empty string", () => {
      expect(slice("", 0)).toBe("");
    });

    it("end is greater than length", () => {
      expect(slice("a", 0, 2)).toBe("a");
    });
  });

  describe("unicode combination", () => {
    it("combined unicode character", () => {
      //           before normalization   normalized
      expect(slice("n\u0303", 0, 1)).toBe("ñ");
    });
  });

  describe("emoji", () => {
    it("normal emoji", () => {
      expect(slice("😀", 0, 1)).toBe("😀");
    });

    it("emoji with zwj", () => {
      expect(slice("👩‍👩‍👦‍👦", 0, 1)).toBe("👩‍👩‍👦‍👦");
    });

    it("emoji with skin-tone", () => {
      expect(slice("👶" + "🏽", 0, 1)).toBe("👶🏽");
    });

    it("emoji flag", () => {
      expect(slice("🇨🇳", 0, 1)).toBe("🇨🇳");
    });

    it("emoji combined", () => {
      expect(slice("n\u0303😀🤪👶🏽👦", 3, 5)).toBe("👶🏽👦");
    });
  });

  describe("ansi", () => {
    it("color", () => {
      expect(slice(chalk.red("RED"), 0, 1)).toBe(chalk.red("R"));
    });

    it("true color", () => {
      const colorFn = chalk.rgb(15, 100, 204);
      expect(slice(colorFn("TRUE COLOR"), 1, 2)).toBe(colorFn("R"));
    });

    it("bg true color", () => {
      const colorFn = chalk.bgRgb(15, 100, 204);
      expect(slice(colorFn("TRUE COLOR"), 1, 2)).toBe(colorFn("R"));
    });

    it("bgColor", () => {
      expect(slice(chalk.bgRed("RED"), 0, 1)).toBe(chalk.bgRed("R"));
    });

    it("bold+color", () => {
      expect(slice(chalk.bold(chalk.red("RED")), 0, 1)).toBe(chalk.bold(chalk.red("R")));
    });

    it("bold(color1+color2)", () => {
      expect(slice(chalk.bold(chalk.red("RED") + chalk.green("GREEN")), 2, 4)).toBe(
        chalk.bold(chalk.red("D") + chalk.green("G"))
      );
    });

    it("bold(color1)+ color2)", () => {
      expect(slice(chalk.bold(chalk.red("RED")) + chalk.green("GREEN"), 2, 4)).toBe(
        chalk.bold(chalk.red("D")) + chalk.green("G")
      );
    });

    it("ansi+emoji", () => {
      expect(slice(chalk.bgWhite("🇨🇳"), 0, 1)).toBe(chalk.bgWhite("🇨🇳"));
    });

    it("ansi+empty string", () => {
      expect(slice(chalk.red(""), 0, 1)).toBe(chalk.red(""));
    });

    it("normal+ansi", () => {
      expect(slice("12" + chalk.red("34") + "56", 1, 5)).toBe("2" + chalk.red("34") + "5");
    });
  });

  describe("malformed ansi", () => {
    it("missing close", () => {
      expect(slice("12" + ESC + "[31m" + "34", 0)).toBe("12" + chalk.red("34"));
    });

    it("undefined code", () => {
      const openCode = ESC + "[71m";
      const closeCode = ESC + "[39m";
      expect(slice(openCode + "12", 0)).toBe(openCode + "12" + closeCode);
    });

    it("malformed open code", () => {
      const openCode = ESC + "[a";
      const content = openCode + "12";
      expect(slice(content, 0)).toBe(openCode + "12");
      expect(slice(content, 0, 1)).toBe("\u001b");
      expect(slice("before" + content, 0)).toBe("before" + openCode + "12");
    });
  });
});
