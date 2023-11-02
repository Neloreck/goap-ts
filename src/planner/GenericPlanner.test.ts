import { describe, expect, it } from "@jest/globals";

import { DirectedWeightedGraph } from "@/graph";
import { GenericPlanner } from "@/planner/GenericPlanner";

describe("GenericPlanner class", () => {
  it("should correctly initialize", () => {
    const planner: GenericPlanner = new GenericPlanner();

    expect(planner["createBaseGraph"]()).toBeInstanceOf(DirectedWeightedGraph);
  });
});
