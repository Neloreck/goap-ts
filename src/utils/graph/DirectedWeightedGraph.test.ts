import { describe, expect, it } from "@jest/globals";

import { DirectedWeightedGraph } from "@/utils/graph/DirectedWeightedGraph";
import { IWeightedEdge } from "@/utils/graph/IWeightedEdge";

describe("DirectedGraph class", () => {
  it("should correctly initialize basic linked graph with builder", () => {
    const oneThree: IWeightedEdge = { weight: 13 };
    const threeOne: IWeightedEdge = { weight: 31 };
    const twoThree: IWeightedEdge = { weight: 23 };
    const threeTwo: IWeightedEdge = { weight: 32 };

    const graph: DirectedWeightedGraph<number> = new DirectedWeightedGraph<number>()
      .addVertex(1)
      .addVertex(2)
      .addVertex(3)
      .addEdge(1, 3, oneThree)
      .addEdge(3, 1, threeOne)
      .addEdge(3, 2, threeTwo)
      .addEdge(2, 3, twoThree);

    expect(graph.getEdges().size).toBe(4);
    expect(graph.hasEdge(1, 3)).toBe(true);
    expect(graph.hasEdge(3, 1)).toBe(true);
    expect(graph.hasEdge(2, 3)).toBe(true);
    expect(graph.hasEdge(3, 2)).toBe(true);
    expect([...graph.getVertices().values()]).toEqual([1, 2, 3]);

    expect(graph.getEdge(1, 2)).toBeNull();
    expect(graph.getEdge(2, 1)).toBeNull();
    expect(graph.getEdge(1, 3)).toBe(oneThree);
    expect(graph.getEdge(3, 1)).toBe(threeOne);
    expect(graph.getEdge(2, 3)).toBe(twoThree);
    expect(graph.getEdge(3, 2)).toBe(threeTwo);
  });
});
