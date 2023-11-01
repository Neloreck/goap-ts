import { describe, expect, it } from "@jest/globals";

import { createBasicConnectedTestGraph, createBasicTestGraph } from "#/fixtures/utils";

import { DirectedGraph } from "@/utils/graph/DirectedGraph";
import { Edge } from "@/utils/graph/Edge";

describe("DirectedGraph class", () => {
  it("should correctly initialize from set", () => {
    const graph: DirectedGraph<number, Edge> = new DirectedGraph([1, 3, 5]);

    expect(graph.getEdges().size).toBe(0);
    expect(graph.getVertices().size).toBe(3);

    expect(graph.getVertices().has(1)).toBe(true);
    expect(graph.getVertices().has(3)).toBe(true);
    expect(graph.getVertices().has(5)).toBe(true);
  });

  it("should correctly initialize basic graph", () => {
    const graph: DirectedGraph<number, Edge> = createBasicTestGraph(5);

    expect([...graph.getEdges().values()]).toEqual([]);
    expect([...graph.getVertices().values()]).toEqual([0, 1, 2, 3, 4]);

    expect(graph.getEdge(0, 1)).toBeNull();
    expect(graph.containsEdge(0, 1)).toBe(false);
    expect(graph.getEdge(1, 2)).toBeNull();
    expect(graph.containsEdge(1, 2)).toBe(false);
  });

  it("should correctly initialize basic linked graph with builder", () => {
    const oneThree: Edge = new Edge();
    const threeOne: Edge = new Edge();
    const twoThree: Edge = new Edge();
    const threeTwo: Edge = new Edge();

    const graph: DirectedGraph<number, Edge> = new DirectedGraph<number, Edge>()
      .addVertex(1)
      .addVertex(2)
      .addVertex(3)
      .addEdge(1, 3, oneThree)
      .addEdge(3, 1, threeOne)
      .addEdge(3, 2, threeTwo)
      .addEdge(2, 3, twoThree);

    expect([...graph.getEdges().values()]).toEqual([oneThree, threeOne, threeTwo, twoThree]);
    expect([...graph.getVertices().values()]).toEqual([1, 2, 3]);

    expect(graph.getEdge(1, 2)).toBeNull();
    expect(graph.getEdge(2, 1)).toBeNull();
    expect(graph.getEdge(1, 3)).toBe(oneThree);
    expect(graph.getEdge(3, 1)).toBe(threeOne);
    expect(graph.getEdge(2, 3)).toBe(twoThree);
    expect(graph.getEdge(3, 2)).toBe(threeTwo);
  });

  it("should correctly initialize linked graph", () => {
    const graph: DirectedGraph<number, Edge> = createBasicConnectedTestGraph(3, 2);

    expect([...graph.getEdges().values()]).toEqual([new Edge(), new Edge()]);
    expect([...graph.getVertices().values()]).toEqual([0, 1, 2]);

    expect(graph.containsEdge(0, 1)).toBe(true);
    expect(graph.containsEdge(1, 2)).toBe(true);
    expect(graph.containsEdge(0, 2)).toBe(false);
  });

  it("should correctly add/remove edges", () => {
    const graph: DirectedGraph<number, Edge> = createBasicTestGraph(3);
    const edge: Edge = new Edge();

    graph.addEdge(0, 1, edge);

    expect(graph.getEdge(0, 1)).toBe(edge);
    expect(graph.containsEdge(0, 1)).toBe(true);

    expect([...graph.getEdges().values()]).toEqual([edge]);
    expect([...graph.getVertices().values()]).toEqual([0, 1, 2]);

    graph.removeEdge(1, 2);

    expect([...graph.getEdges().values()]).toEqual([edge]);
    expect([...graph.getVertices().values()]).toEqual([0, 1, 2]);

    graph.removeEdge(0, 1);

    expect([...graph.getEdges().values()]).toEqual([]);
    expect([...graph.getVertices().values()]).toEqual([0, 1, 2]);
  });
});
