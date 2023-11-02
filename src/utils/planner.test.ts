import { describe, expect, it } from "@jest/globals";

import { GenericAction } from "#/fixtures/mocks";

import { AbstractAction } from "@/AbstractAction";
import { GraphNode } from "@/planner";
import { Property } from "@/Property";
import { Optional } from "@/types";
import { DirectedWeightedGraph, IEdge, IPath, IWeightedEdge } from "@/utils/graph";
import { IWeightedPath } from "@/utils/graph/IWeightedPath";
import { createPath, createWeightedPath } from "@/utils/path";
import { addNodeToGraphPathEnd, areAllPreconditionsMet, extractActionsFromGraphPath } from "@/utils/planner";

describe("planner utils module", () => {
  it("extractActionsFromGraphPath should correctly extract actions from graph path", async () => {
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

    const halfActions: Array<AbstractAction> = extractActionsFromGraphPath(
      createPath(graph, start, second, [start, second], [graph.getEdge(start, second) as IEdge]) as IPath<GraphNode>,
      start,
      second
    );
    const firstActions: Array<AbstractAction> = extractActionsFromGraphPath(
      createPath(
        graph,
        start,
        firstEnd,
        [start, second, third, firstEnd],
        [
          graph.getEdge(start, second) as IEdge,
          graph.getEdge(second, third) as IEdge,
          graph.getEdge(third, firstEnd) as IEdge,
        ]
      ) as IPath<GraphNode>,
      start,
      firstEnd
    );
    const secondActions: Array<AbstractAction> = extractActionsFromGraphPath(
      createPath(
        graph,
        start,
        secondEnd,
        [start, second, fifth, secondEnd],
        [
          graph.getEdge(start, second) as IEdge,
          graph.getEdge(second, fifth) as IEdge,
          graph.getEdge(fifth, secondEnd) as IEdge,
        ]
      ) as IPath<GraphNode>,
      start,
      secondEnd
    );

    expect(halfActions).toHaveLength(0);
    expect(firstActions).toHaveLength(2);
    expect(firstActions).toEqual([second.action, third.action]);
    expect(secondActions).toHaveLength(2);
    expect(secondActions).toEqual([second.action, fifth.action]);
  });

  it("addNodeToGraphPathEnd should correctly add node to graph path and return new one", () => {
    const first: GraphNode = new GraphNode([], [], new GenericAction(1));
    const second: GraphNode = new GraphNode([], [], new GenericAction(2));
    const third: GraphNode = new GraphNode([], [], new GenericAction(3));
    const fourth: GraphNode = new GraphNode([], [], new GenericAction(4));

    const graph: DirectedWeightedGraph<GraphNode> = new DirectedWeightedGraph<GraphNode>().addVertices([
      first,
      second,
      third,
      fourth,
    ]);

    graph.addEdge(first, second, { weight: 10 });
    graph.addEdge(second, third, { weight: 10 });
    graph.addEdge(third, fourth, { weight: 10 });

    const path: IWeightedPath<GraphNode> = createWeightedPath(
      graph,
      first,
      second,
      [first, second],
      [graph.getEdge(first, second) as IWeightedEdge]
    ) as IWeightedPath<GraphNode>;

    const secondPath: Optional<IWeightedPath<GraphNode>> = addNodeToGraphPathEnd(graph, path, third);

    expect(secondPath).not.toBeNull();
    expect(secondPath?.start).toBe(first);
    expect(secondPath?.end).toBe(third);
    expect(secondPath?.vertices).toEqual([first, second, third]);
    expect(secondPath?.edges).toEqual([graph.getEdge(first, second), graph.getEdge(second, third)]);

    const thirdPath: Optional<IWeightedPath<GraphNode>> = addNodeToGraphPathEnd(
      graph,
      secondPath as IWeightedPath<GraphNode>,
      fourth
    );

    expect(thirdPath).not.toBeNull();
    expect(thirdPath?.start).toBe(first);
    expect(thirdPath?.end).toBe(fourth);
    expect(thirdPath?.vertices).toEqual([first, second, third, fourth]);
    expect(thirdPath?.edges).toEqual([...graph.getEdges()]);

    expect(addNodeToGraphPathEnd(graph, path as IWeightedPath<GraphNode>, fourth)).toBeNull();
    expect(addNodeToGraphPathEnd(graph, path as IWeightedPath<GraphNode>, new GraphNode([], []))).toBeNull();
    expect(
      addNodeToGraphPathEnd(graph, secondPath as IWeightedPath<GraphNode>, new GraphNode([], [], new GenericAction(55)))
    ).toBeNull();
  });

  it("areAllPreconditionsMet should correctly check two list of properties", () => {
    expect(areAllPreconditionsMet([], [])).toBe(true);
    expect(areAllPreconditionsMet([], [new Property("a", true), new Property("b", false)])).toBe(true);
    expect(areAllPreconditionsMet([new Property("a", true), new Property("b", false)], [])).toBe(false);
    expect(areAllPreconditionsMet([new Property("a", true), new Property("b", false)], [new Property("b", true)])).toBe(
      false
    );
    expect(
      areAllPreconditionsMet([new Property("a", true), new Property("b", false)], [new Property("b", false)])
    ).toBe(false);
    expect(
      areAllPreconditionsMet(
        [new Property("a", true), new Property("b", false)],
        [new Property("a", false), new Property("b", false)]
      )
    ).toBe(false);
    expect(
      areAllPreconditionsMet(
        [new Property("a", true), new Property("b", false)],
        [new Property("a", true), new Property("b", false)]
      )
    ).toBe(true);
  });
});
