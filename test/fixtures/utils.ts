import { Optional } from "@/types";
import { DirectedGraph, Edge, IPath } from "@/utils/graph";
import { createPath } from "@/utils/path";

/**
 * todo;
 */
export function createBasicTestGraph(vertexCount: number): DirectedGraph<number, Edge> {
  const graph: DirectedGraph<number, Edge> = new DirectedGraph();

  for (let it = 0; it < vertexCount; it++) {
    graph.addVertex(it);
  }

  return graph;
}

/**
 * todo;
 */
export function createBasicConnectedTestGraph(vertexCount: number, edgeCount: number): DirectedGraph<number, Edge> {
  const graph: DirectedGraph<number, Edge> = createBasicTestGraph(vertexCount);

  for (let it = 0; it < edgeCount; it++) {
    graph.addEdge(it, it + 1, new Edge());
  }

  return graph;
}

/**
 * todo;
 */
export function createBasicTestPath(vertexCount: number, edgeCount: number): Optional<IPath<number, Edge>> {
  const graph: DirectedGraph<number, Edge> = createBasicConnectedTestGraph(vertexCount, edgeCount);

  // Vertices and edges retrieved with a breadthSearch or depthSearch would be better / ideal.
  const vertices: Array<number> = [];
  const edges: Array<Edge> = [];

  for (let it = 0; it <= edgeCount; it++) {
    if (it < edgeCount) {
      edges.push(graph.getEdge(it, it + 1) as Edge);
    }

    vertices.push(it);
  }

  return createPath(graph, vertices[0], vertices[vertices.length - 1], vertices, edges);
}
