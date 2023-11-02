import { Optional } from "@/types";
import { IPath } from "@/utils/graph";
import { Edge } from "@/utils/graph/Edge";
import { IGraph } from "@/utils/graph/IGraph";
import { IWeightedPath } from "@/utils/graph/IWeightedPath";
import { WeightedEdge } from "@/utils/graph/WeightedEdge";

/**
 * Function for generating a simple Path.
 * The given information are being checked against the given Graph.
 *
 * @param graph - the Graph the information are being checked against
 * @param start - the starting vertex of the Path
 * @param end - the end vertex of the Path
 * @param vertices - the List of all vertices of the Path
 * @param edges - the List of all edges of the Path
 * @returns a Path leading from one point inside the Graph to another one
 */
export function createPath<VertexType, EdgeType extends Edge>(
  graph: IGraph<VertexType, EdgeType>,
  start: VertexType,
  end: VertexType,
  vertices: Array<VertexType>,
  edges: Array<EdgeType>
): Optional<IPath<VertexType, EdgeType>> {
  return validateStartAndEnd(start, end, vertices) && validateConnections(graph, vertices)
    ? { vertices, edges, start, end }
    : null;
}

/**
 * Function for generating a WeightedPath. The given information are being
 * checked against the given Graph.
 *
 * @param graph - the Graph the information are being checked against
 * @param start - the starting vertex of the WeightedPath
 * @param end - the end vertex of the WeightedPath
 * @param vertices - the List of all vertices of the WeightedPath
 * @param edges - the List of all edges of the WeightedPath
 * @returns a WeightedPath leading from one point inside the Graph to another one
 */
export function createWeightedPath<VertexType, EdgeType extends WeightedEdge>(
  graph: IGraph<VertexType, EdgeType>,
  start: VertexType,
  end: VertexType,
  vertices: Array<VertexType>,
  edges: Array<EdgeType>
): Optional<IWeightedPath<VertexType, EdgeType>> {
  if (validateStartAndEnd(start, end, vertices) && validateConnections(graph, vertices)) {
    let totalWeight: number = 0;

    for (const edge of edges) {
      totalWeight += edge.getWeight();
    }

    return {
      start,
      end,
      edges,
      vertices,
      totalWeight,
    };
  } else {
    return null;
  }
}

/**
 * @param start - the provided start vertex
 * @param end - the provided end vertex
 * @param vertices - the List of all vertices
 * @returns if the provided vertices are indeed the start and the end vertices
 */
export function validateStartAndEnd<VertexType>(
  start: VertexType,
  end: VertexType,
  vertices: Array<VertexType>
): boolean {
  return vertices[0] === start && vertices[vertices.length - 1] === end;
}

/**
 * Function for validating all vertices and edges of the given Lists.
 *
 * @param graph - the graph the information is being checked against
 * @param vertices - the List of all vertices of the Path being created
 * @returns if the provided Lists match the given graph
 */
export function validateConnections<VertexType, EdgeType extends Edge>(
  graph: IGraph<VertexType, EdgeType>,
  vertices: Array<VertexType>
): boolean {
  let previousVertex: Optional<VertexType> = null;

  for (const vertex of vertices) {
    if (previousVertex && !graph.hasEdge(previousVertex, vertex)) {
      return false;
    }

    previousVertex = vertex;
  }

  return true;
}
