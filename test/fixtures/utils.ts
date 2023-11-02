import { DirectedGraph } from "@/graph";

/**
 * todo;
 */
export function createBasicTestGraph(vertexCount: number): DirectedGraph<number> {
  const graph: DirectedGraph<number> = new DirectedGraph();

  for (let it = 0; it < vertexCount; it++) {
    graph.addVertex(it);
  }

  return graph;
}

/**
 * todo;
 */
export function createBasicConnectedTestGraph(vertexCount: number, edgeCount: number): DirectedGraph<number> {
  const graph: DirectedGraph<number> = createBasicTestGraph(vertexCount);

  for (let it = 0; it < edgeCount; it++) {
    graph.addEdge(it, it + 1, {});
  }

  return graph;
}
