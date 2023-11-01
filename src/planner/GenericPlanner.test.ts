import { describe, expect, it } from "@jest/globals";

import { GenericPlanner } from "@/planner/GenericPlanner";
import { DirectedWeightedGraph } from "@/utils/graph";

describe("GenericPlanner class", () => {
  it("should correctly initialize", () => {
    const planner: GenericPlanner = new GenericPlanner();

    expect(planner["createBaseGraph"]()).toBeInstanceOf(DirectedWeightedGraph);
  });
});
