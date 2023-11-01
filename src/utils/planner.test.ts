import { describe, expect, it } from "@jest/globals";

import { Property } from "@/Property";
import { areAllPreconditionsMet } from "@/utils/planner";

describe("planner utils module", () => {
  it("areAllPreconditionsMet should correctly check two list of properties", () => {
    expect(areAllPreconditionsMet([], [])).toBe(true);
    expect(areAllPreconditionsMet([], [new Property("a", true), new Property("b", false)])).toBe(true);
    expect(areAllPreconditionsMet([new Property("a", true), new Property("b", false)], [])).toBe(false);
    expect(areAllPreconditionsMet([new Property("a", true), new Property("b", false)], [new Property("b", true)])).toBe(
      false
    );
    expect(
      areAllPreconditionsMet([new Property("a", true), new Property("b", false)], [new Property("b", false)])
    ).toBe(false);
    expect(
      areAllPreconditionsMet(
        [new Property("a", true), new Property("b", false)],
        [new Property("a", false), new Property("b", false)]
      )
    ).toBe(false);
    expect(
      areAllPreconditionsMet(
        [new Property("a", true), new Property("b", false)],
        [new Property("a", true), new Property("b", false)]
      )
    ).toBe(true);
  });
});
