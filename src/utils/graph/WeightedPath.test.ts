import { describe, expect, it } from "@jest/globals";

import { WeightedEdge } from "@/utils/graph/WeightedEdge";
import { WeightedPath } from "@/utils/graph/WeightedPath";

describe("WeightedPath class", () => {
  it("should correctly initialize and count total weight when empty", () => {
    const path: WeightedPath<number, WeightedEdge> = new WeightedPath([], [], 0, 0);

    expect(path.getTotalWeight()).toBe(0);
  });

  it("should correctly initialize and count total weight when have some edges", () => {
    const path: WeightedPath<number, WeightedEdge> = new WeightedPath(
      [],
      [new WeightedEdge(4), new WeightedEdge(6), new WeightedEdge(10)],
      0,
      0
    );

    expect(path.getTotalWeight()).toBe(20);
  });
});
