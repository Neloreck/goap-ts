import { Optional } from "@/types";
import { DirectedGraph, IEdge, IPath } from "@/utils/graph";
import { createPath } from "@/utils/path";

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

/**
 * todo;
 */
export function createBasicTestPath(vertexCount: number, edgeCount: number): Optional<IPath<number>> {
  const graph: DirectedGraph<number> = createBasicConnectedTestGraph(vertexCount, edgeCount);

  // Vertices and edges retrieved with a breadthSearch or depthSearch would be better / ideal.
  const vertices: Array<number> = [];
  const edges: Array<IEdge> = [];

  for (let it = 0; it <= edgeCount; it++) {
    if (it < edgeCount) {
      edges.push(graph.getEdge(it, it + 1) as IEdge);
    }

    vertices.push(it);
  }

  return createPath(graph, vertices[0], vertices[vertices.length - 1], vertices, edges);
}
