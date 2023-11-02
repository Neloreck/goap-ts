import { IEdge, IPath, IWeightedEdge } from "src/graph";

import { Properties } from "@/alias";
import { IGraph } from "@/graph/IGraph";
import { IWeightedPath } from "@/graph/IWeightedPath";
import { Optional } from "@/types";
import { removeFromArray } from "@/utils/array";

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
  const combined: Properties = [...pathEffects];
  const statesToBeRemoved: Properties = [];

  // Mark effects to be removed.
  for (const nodeWorldState of combined) {
    for (const pathNodeEffect of nodeEffects) {
      if (nodeWorldState.id === pathNodeEffect.id) {
        statesToBeRemoved.push(nodeWorldState);
      }
    }
  }

  // Remove marked effects from the state.
  for (const state of statesToBeRemoved) {
    removeFromArray(combined, state);
  }

  return combined.concat(nodeEffects);
}
