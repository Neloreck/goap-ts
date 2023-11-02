import { describe, expect, it } from "@jest/globals";

import { createBasicConnectedTestGraph, createBasicTestGraph } from "#/fixtures/utils";

import { DirectedGraph } from "@/graph/DirectedGraph";
import { IEdge } from "@/graph/IEdge";

describe("DirectedGraph class", () => {
  it("should correctly initialize from set", () => {
    const graph: DirectedGraph<number> = new DirectedGraph([1, 3, 5]);

    expect(graph.getEdges()).toHaveLength(0);
    expect(graph.getVertices()).toHaveLength(3);

    expect(graph.getVertices()).toContain(1);
    expect(graph.getVertices()).toContain(3);
    expect(graph.getVertices()).toContain(5);
  });

  it("should correctly initialize basic graph", () => {
    const graph: DirectedGraph<number> = createBasicTestGraph(5);

    expect(graph.getEdges()).toEqual([]);
    expect(graph.getVertices()).toEqual([0, 1, 2, 3, 4]);

    expect(graph.getEdge(0, 1)).toBeNull();
    expect(graph.hasEdge(0, 1)).toBe(false);
    expect(graph.getEdge(1, 2)).toBeNull();
    expect(graph.hasEdge(1, 2)).toBe(false);
  });

  it("should correctly initialize basic linked graph with builder", () => {
    const oneThree: IEdge = {};
    const threeOne: IEdge = {};
    const twoThree: IEdge = {};
    const threeTwo: IEdge = {};

    const graph: DirectedGraph<number> = new DirectedGraph<number>()
      .addVertex(1)
      .addVertex(2)
      .addVertex(3)
      .addEdge(1, 3, oneThree)
      .addEdge(3, 1, threeOne)
      .addEdge(3, 2, threeTwo)
      .addEdge(2, 3, twoThree);

    expect(graph.getEdges()).toEqual([oneThree, threeOne, threeTwo, twoThree]);
    expect(graph.getVertices()).toEqual([1, 2, 3]);

    expect(graph.getEdge(1, 2)).toBeNull();
    expect(graph.getEdge(2, 1)).toBeNull();
    expect(graph.getEdge(1, 3)).toBe(oneThree);
    expect(graph.getEdge(3, 1)).toBe(threeOne);
    expect(graph.getEdge(2, 3)).toBe(twoThree);
    expect(graph.getEdge(3, 2)).toBe(threeTwo);
  });

  it("should correctly initialize linked graph", () => {
    const graph: DirectedGraph<number> = createBasicConnectedTestGraph(3, 2);

    expect(graph.getEdges()).toEqual([{}, {}]);
    expect(graph.getVertices()).toEqual([0, 1, 2]);

    expect(graph.hasEdge(0, 1)).toBe(true);
    expect(graph.hasEdge(1, 2)).toBe(true);
    expect(graph.hasEdge(0, 2)).toBe(false);
  });

  it("should correctly add/remove edges", () => {
    const graph: DirectedGraph<number> = createBasicTestGraph(3);
    const edge: IEdge = {};

    graph.addEdge(0, 1, edge);

    expect(graph.getEdge(0, 1)).toBe(edge);
    expect(graph.hasEdge(0, 1)).toBe(true);

    expect(graph.getEdges()).toEqual([edge]);
    expect(graph.getVertices()).toEqual([0, 1, 2]);

    graph.removeEdge(1, 2);

    expect(graph.getEdges()).toEqual([edge]);
    expect(graph.getVertices()).toEqual([0, 1, 2]);

    graph.removeEdge(0, 1);

    expect(graph.getEdges()).toEqual([]);
    expect(graph.getVertices()).toEqual([0, 1, 2]);
  });

  it("should correctly add many vertices", () => {
    const graph: DirectedGraph<number> = new DirectedGraph();

    graph.addVertex(1).addVertex(2).addVertices([3, 4, 5]);

    expect(graph.getVertices()).toHaveLength(5);
    expect(graph.getVertices()).toEqual([1, 2, 3, 4, 5]);
  });
});
