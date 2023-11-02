import { Properties } from "@/alias";
import { IEdge, IPath, IWeightedEdge } from "@/graph";
import { IGraph } from "@/graph/IGraph";
import { IWeightedPath } from "@/graph/IWeightedPath";
import { Optional } from "@/types";

/**
 * Function for generating a simple path.
 * The given information are being checked against the given graph.
 *
 * @param graph - the Graph the information are being checked against
 * @param start - the starting vertex of the path
 * @param end - the end vertex of the path
 * @param vertices - the List of all vertices of the path
 * @param edges - the List of all edges of the path
 * @returns a path leading from one point inside the graph to another one
 */
export function createPath<VertexType, EdgeType extends IEdge>(
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
 * Function for generating a path. The given information are being checked against the given graph.
 *
 * @param graph - the Graph the information are being checked against
 * @param start - the starting vertex of the path
 * @param end - the end vertex of the path
 * @param vertices - the list of all vertices of the path
 * @param edges - the list of all edges of the path
 * @returns a path leading from one point inside the graph to another one
 */
export function createWeightedPath<VertexType, EdgeType extends IWeightedEdge>(
  graph: IGraph<VertexType, EdgeType>,
  start: VertexType,
  end: VertexType,
  vertices: Array<VertexType>,
  edges: Array<EdgeType>
): Optional<IWeightedPath<VertexType, EdgeType>> {
  if (validateStartAndEnd(start, end, vertices) && validateConnections(graph, vertices)) {
    let totalWeight: number = 0;

    for (const edge of edges) {
      totalWeight += edge.weight;
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
 * @param vertices - the list of all vertices
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
 * Function for validating all vertices and edges of the given lists.
 *
 * @param graph - the graph the information is being checked against
 * @param vertices - the list of all vertices of the path being created
 * @returns if the provided list match the given graph
 */
export function validateConnections<VertexType, EdgeType extends IEdge>(
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

/**
 * Function for adding all effects in a path together to get the effect at the last node in the path.
 *
 * @param pathEffects - list of properties from path to previous node
 * @param nodeEffects - list of properties from current path node
 * @returns new set of effects which reflects application of node effects to path effects
 */
export function mergePathEffectsTogether(
  pathEffects: Readonly<Properties>,
  nodeEffects: Readonly<Properties>
): Properties {
  // New immutable set of effects.
  const combined: Properties = [...pathEffects];

  for (let i = 0; i < nodeEffects.length; i++) {
    let isMissing: boolean = true;

    for (let j = 0; j < pathEffects.length; j++) {
      if (nodeEffects[i].id === pathEffects[j].id) {
        isMissing = false;
        combined[j] = nodeEffects[i];

        break;
      }
    }

    // New effect, not accounted in previous state.
    if (isMissing) {
      combined.push(nodeEffects[i]);
    }
  }

  return combined;
}

/**
 * @param path - path to check for similarities
 * @param paths - list of paths to check inclusion with
 * @returns whether provided path is subset of one of listed ones
 */
export function isOneOfPaths<T>(path: IPath<T>, paths: Array<IPath<T>>): boolean {
  // If it is same path, then just do not add it.
  for (const it of paths) {
    let isSamePath: boolean = true;

    for (let i = 0; i < it.vertices.length; i++) {
      if (it.vertices[i] !== path.vertices[i]) {
        isSamePath = false;
        break;
      }
    }

    // All path nodes are same.
    if (isSamePath) {
      return true;
    }
  }

  return false;
}
