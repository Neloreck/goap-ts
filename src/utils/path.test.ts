import { describe, expect, it } from "@jest/globals";

import { GenericAction } from "#/fixtures/mocks";

import { DirectedWeightedGraph, IEdge, IPath } from "@/graph";
import { GraphNode } from "@/planner";
import { Property } from "@/property/Property";
import { Optional } from "@/types";
import { createPath, isOneOfPaths, mergePathEffectsTogether } from "@/utils/path";

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

  it("mergePathEffectsTogether should combine effects of previous node and current", () => {
    expect(
      mergePathEffectsTogether(
        [new Property("has_weapon", false), new Property("has_ammo", false)],
        [new Property("has_weapon", true)]
      )
    ).toEqual([new Property("has_weapon", true), new Property("has_ammo", false)]);

    expect(
      mergePathEffectsTogether(
        [new Property("has_weapon", false), new Property("has_ammo", false)],
        [new Property("has_weapon", false), new Property("has_ammo", false)]
      )
    ).toEqual([new Property("has_weapon", false), new Property("has_ammo", false)]);

    expect(
      mergePathEffectsTogether(
        [new Property("has_weapon", false), new Property("has_ammo", false)],
        [new Property("has_weapon", true), new Property("has_ammo", true)]
      )
    ).toEqual([new Property("has_weapon", true), new Property("has_ammo", true)]);

    expect(mergePathEffectsTogether([new Property("has_weapon", false), new Property("has_ammo", false)], [])).toEqual([
      new Property("has_weapon", false),
      new Property("has_ammo", false),
    ]);

    expect(mergePathEffectsTogether([], [new Property("has_weapon", false), new Property("has_ammo", false)])).toEqual([
      new Property("has_weapon", false),
      new Property("has_ammo", false),
    ]);

    expect(
      mergePathEffectsTogether(
        [new Property(1, 40), new Property("a", "test"), new Property("same", "same")],
        [new Property(1, 50), new Property("a", "result"), new Property("c", "new")]
      )
    ).toEqual([
      new Property(1, 50),
      new Property("a", "result"),
      new Property("same", "same"),
      new Property("c", "new"),
    ]);
  });

  it("isOneOfPaths should check path inclusion", () => {
    const graph: DirectedWeightedGraph<number> = new DirectedWeightedGraph<number>().addVertices([1, 2, 3, 4, 9, 16]);

    graph
      .addEdge(1, 2, { weight: 1 })
      .addEdge(2, 3, { weight: 2 })
      .addEdge(2, 4, { weight: 2 })
      .addEdge(3, 9, { weight: 2 })
      .addEdge(4, 16, { weight: 2 });

    const firstPath: IPath<number> = createPath(graph, 1, 2, [1, 2], [graph.getEdge(1, 2) as IEdge]) as IPath<number>;

    const secondPath: IPath<number> = createPath(
      graph,
      1,
      9,
      [1, 2, 3, 9],
      [graph.getEdge(1, 2) as IEdge, graph.getEdge(2, 3) as IEdge, graph.getEdge(3, 9) as IEdge]
    ) as IPath<number>;

    const thirdPath: IPath<number> = createPath(
      graph,
      1,
      16,
      [1, 2, 4, 16],
      [graph.getEdge(1, 2) as IEdge, graph.getEdge(2, 4) as IEdge, graph.getEdge(4, 16) as IEdge]
    ) as IPath<number>;

    expect(isOneOfPaths(firstPath, [firstPath])).toBe(true);
    expect(isOneOfPaths(firstPath, [thirdPath, secondPath, firstPath])).toBe(true);
    expect(isOneOfPaths(secondPath, [thirdPath, secondPath, firstPath])).toBe(true);
    expect(isOneOfPaths(thirdPath, [thirdPath, secondPath, firstPath])).toBe(true);
    expect(
      isOneOfPaths(createPath(graph, 1, 2, [1, 2], [graph.getEdge(1, 2) as IEdge]) as IPath<number>, [
        thirdPath,
        secondPath,
        firstPath,
      ])
    ).toBe(true);

    expect(isOneOfPaths(firstPath, [])).toBe(false);
    expect(isOneOfPaths(firstPath, [secondPath, thirdPath])).toBe(false);
    expect(
      isOneOfPaths(
        createPath(
          graph,
          1,
          3,
          [1, 2, 3],
          [graph.getEdge(1, 2) as IEdge, graph.getEdge(2, 3) as IEdge]
        ) as IPath<number>,
        [thirdPath, secondPath, firstPath]
      )
    ).toBe(true);
  });
});
