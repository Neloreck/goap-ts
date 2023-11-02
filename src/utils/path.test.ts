import { describe, expect, it } from "@jest/globals";

import { GenericAction } from "#/fixtures/mocks";

import { GraphNode } from "@/planner";
import { Optional } from "@/types";
import { DirectedWeightedGraph, Edge, IPath, WeightedEdge } from "@/utils/graph";
import { createPath } from "@/utils/path";

describe("path utils module", () => {
  it("extractActionsFromGraphPath should correctly extract actions from graph path", async () => {
    const start: GraphNode = new GraphNode([], [], new GenericAction(1));
    const second: GraphNode = new GraphNode([], [], new GenericAction(2));
    const third: GraphNode = new GraphNode([], [], new GenericAction(3));
    const fifth: GraphNode = new GraphNode([], [], new GenericAction(4));
    const firstEnd: GraphNode = new GraphNode([], [], new GenericAction(5));
    const secondEnd: GraphNode = new GraphNode([], [], new GenericAction(6));

    const graph: DirectedWeightedGraph<GraphNode> = new DirectedWeightedGraph<GraphNode, WeightedEdge>().addVertices([
      start,
      second,
      third,
      fifth,
      firstEnd,
      secondEnd,
    ]);

    graph
      .addEdge(start, second, new WeightedEdge(1))
      .addEdge(second, third, new WeightedEdge(2))
      .addEdge(second, fifth, new WeightedEdge(2))
      .addEdge(third, firstEnd, new WeightedEdge(2))
      .addEdge(fifth, secondEnd, new WeightedEdge(2));

    const firstPath: Optional<IPath<GraphNode>> = createPath(
      graph,
      start,
      second,
      [start, second],
      [graph.getEdge(start, second) as Edge]
    );

    const secondPath: Optional<IPath<GraphNode>> = createPath(
      graph,
      start,
      firstEnd,
      [start, second, third, firstEnd],
      [
        graph.getEdge(start, second) as Edge,
        graph.getEdge(second, third) as Edge,
        graph.getEdge(third, firstEnd) as Edge,
      ]
    );

    const thirdPath: Optional<IPath<GraphNode>> = createPath(
      graph,
      start,
      secondEnd,
      [start, second, fifth, secondEnd],
      [
        graph.getEdge(start, second) as Edge,
        graph.getEdge(second, fifth) as Edge,
        graph.getEdge(fifth, secondEnd) as Edge,
      ]
    );

    expect(firstPath).not.toBeNull();
    expect(firstPath).toEqual({
      start,
      end: second,
      vertices: [start, second],
      edges: [graph.getEdge(start, second) as Edge],
    });

    expect(secondPath).not.toBeNull();
    expect(secondPath).toEqual({
      start,
      end: firstEnd,
      vertices: [start, second, third, firstEnd],
      edges: [
        graph.getEdge(start, second) as Edge,
        graph.getEdge(second, third) as Edge,
        graph.getEdge(third, firstEnd) as Edge,
      ],
    });

    expect(thirdPath).not.toBeNull();
    expect(thirdPath).toEqual({
      start,
      end: secondEnd,
      vertices: [start, second, fifth, secondEnd],
      edges: [
        graph.getEdge(start, second) as Edge,
        graph.getEdge(second, fifth) as Edge,
        graph.getEdge(fifth, secondEnd) as Edge,
      ],
    });

    // Not existing.
    expect(
      createPath(
        graph,
        start,
        secondEnd,
        [start, second, third, firstEnd],
        [
          graph.getEdge(start, second) as Edge,
          graph.getEdge(second, third) as Edge,
          graph.getEdge(third, firstEnd) as Edge,
        ]
      )
    ).toBeNull();

    // Not existing.
    expect(
      createPath(
        graph,
        start,
        fifth,
        [start, second, third, firstEnd],
        [
          graph.getEdge(start, second) as Edge,
          graph.getEdge(second, third) as Edge,
          graph.getEdge(third, firstEnd) as Edge,
        ]
      )
    ).toBeNull();
  });
});
