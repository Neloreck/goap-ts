import { describe, expect, it } from "@jest/globals";

import { AnyObject } from "@/types";
import { DirectedWeightedGraph } from "@/utils/graph/DirectedWeightedGraph";
import { WeightedEdge } from "@/utils/graph/WeightedEdge";

describe("DirectedGraph class", () => {
  it("should correctly initialize basic linked graph with builder", () => {
    const oneThree: WeightedEdge = new WeightedEdge(13);
    const threeOne: WeightedEdge = new WeightedEdge(31);
    const twoThree: WeightedEdge = new WeightedEdge(23);
    const threeTwo: WeightedEdge = new WeightedEdge(32);

    const graph: DirectedWeightedGraph<number, WeightedEdge> = new DirectedWeightedGraph<number, WeightedEdge>()
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

    expect(graph.getEdgeWeight(graph.getEdge(1, 3) as WeightedEdge)).toBe(13);
    expect(graph.getEdgeWeight(graph.getEdge(3, 1) as WeightedEdge)).toBe(31);
    expect(graph.getEdgeWeight(graph.getEdge(3, 2) as WeightedEdge)).toBe(32);
    expect(graph.getEdgeWeight(graph.getEdge(2, 3) as WeightedEdge)).toBe(23);
  });

  it("should correctly set vertex weight", () => {
    const graph: DirectedWeightedGraph<AnyObject, WeightedEdge> = new DirectedWeightedGraph([]);

    const first: WeightedEdge = new WeightedEdge(10);
    const second: WeightedEdge = new WeightedEdge(11);

    graph.setEdgeWeight(first, 4);
    expect(first.getWeight()).toBe(4);

    graph.setEdgeWeight(second, 25);
    expect(second.getWeight()).toBe(25);
  });

  it("should correctly get vertex weight", () => {
    const graph: DirectedWeightedGraph<AnyObject, WeightedEdge> = new DirectedWeightedGraph([]);

    const first: WeightedEdge = new WeightedEdge(10);
    const second: WeightedEdge = new WeightedEdge(11);

    expect(graph.getEdgeWeight(first)).toBe(10);
    expect(graph.getEdgeWeight(second)).toBe(11);
  });
});
