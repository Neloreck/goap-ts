import { describe, expect, it } from "@jest/globals";

import { WeightedEdge } from "@/utils/graph/WeightedEdge";

describe("WeightedEdge class", () => {
  it("should correctly initialize", () => {
    expect(new WeightedEdge().getWeight()).toBe(0);
    expect(new WeightedEdge(25).getWeight()).toBe(25);
  });

  it("should correctly set weight", () => {
    const edge: WeightedEdge = new WeightedEdge();

    expect(edge.getWeight()).toBe(0);

    edge.setWeight(33);

    expect(edge.getWeight()).toBe(33);
  });
});
