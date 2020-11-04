import { capitalize } from "../src/utils";

describe("utils", () => {
  describe("#capitalize", () => {
    it("should handle undefined and empty text", () => {
      // @ts-ignore
      expect(capitalize()).toBeUndefined();
      expect(capitalize("")).toEqual("");
    });

    it("should capitalize short text", () => {
      expect(capitalize("A")).toEqual("A");
      expect(capitalize("a")).toEqual("A");
    });

    it("should capitalize long text", () => {
      expect(capitalize("Test")).toEqual("Test");
      expect(capitalize("test")).toEqual("Test");
      expect(capitalize("123test")).toEqual("123test");
    });
  });
});
