import { describe, expect, it } from "@jest/globals";

import { GenericAction } from "#/fixtures/mocks";

import { DirectedWeightedGraph, IEdge, IPath } from "@/graph";
import { GraphNode } from "@/planner";
import { Optional } from "@/types";
import { createPath } from "@/utils/path";

describe("path utils module", () => {
  it("extractActionsFromGraphPath should correctly extract actions from graph path", () => {
    const start: GraphNode = new GraphNode([], [], new GenericAction(1));
    const second: GraphNode = new GraphNode([], [], new GenericAction(2));
    const third: GraphNode = new GraphNode([], [], new GenericAction(3));
    const fifth: GraphNode = new GraphNode([], [], new GenericAction(4));
    const firstEnd: GraphNode = new GraphNode([], [], new GenericAction(5));
    const secondEnd: GraphNode = new GraphNode([], [], new GenericAction(6));

    const graph: DirectedWeightedGraph<GraphNode> = new DirectedWeightedGraph<GraphNode>().addVertices([
      start,
      second,
      third,
      fifth,
      firstEnd,
      secondEnd,
    ]);

    graph
      .addEdge(start, second, { weight: 1 })
      .addEdge(second, third, { weight: 2 })
      .addEdge(second, fifth, { weight: 2 })
      .addEdge(third, firstEnd, { weight: 2 })
      .addEdge(fifth, secondEnd, { weight: 2 });

    const firstPath: Optional<IPath<GraphNode>> = createPath(
      graph,
      start,
      second,
      [start, second],
      [graph.getEdge(start, second) as IEdge]
    );

    const secondPath: Optional<IPath<GraphNode>> = createPath(
      graph,
      start,
      firstEnd,
      [start, second, third, firstEnd],
      [
        graph.getEdge(start, second) as IEdge,
        graph.getEdge(second, third) as IEdge,
        graph.getEdge(third, firstEnd) as IEdge,
      ]
    );

    const thirdPath: Optional<IPath<GraphNode>> = createPath(
      graph,
      start,
      secondEnd,
      [start, second, fifth, secondEnd],
      [
        graph.getEdge(start, second) as IEdge,
        graph.getEdge(second, fifth) as IEdge,
        graph.getEdge(fifth, secondEnd) as IEdge,
      ]
    );

    expect(firstPath).not.toBeNull();
    expect(firstPath).toEqual({
      start,
      end: second,
      vertices: [start, second],
      edges: [graph.getEdge(start, second) as IEdge],
    });

    expect(secondPath).not.toBeNull();
    expect(secondPath).toEqual({
      start,
      end: firstEnd,
      vertices: [start, second, third, firstEnd],
      edges: [
        graph.getEdge(start, second) as IEdge,
        graph.getEdge(second, third) as IEdge,
        graph.getEdge(third, firstEnd) as IEdge,
      ],
    });

    expect(thirdPath).not.toBeNull();
    expect(thirdPath).toEqual({
      start,
      end: secondEnd,
      vertices: [start, second, fifth, secondEnd],
      edges: [
        graph.getEdge(start, second) as IEdge,
        graph.getEdge(second, fifth) as IEdge,
        graph.getEdge(fifth, secondEnd) as IEdge,
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
          graph.getEdge(start, second) as IEdge,
          graph.getEdge(second, third) as IEdge,
          graph.getEdge(third, firstEnd) as IEdge,
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
          graph.getEdge(start, second) as IEdge,
          graph.getEdge(second, third) as IEdge,
          graph.getEdge(third, firstEnd) as IEdge,
        ]
      )
    ).toBeNull();
  });
});
