import { IPath, IWeightedEdge, IWeightedGraph } from "src/graph";

import { AbstractAction } from "@/AbstractAction";
import { Properties } from "@/alias";
import { IWeightedPath } from "@/graph/IWeightedPath";
import { GraphNode } from "@/planner/GraphNode";
import { IProperty } from "@/property";
import { Optional } from "@/types";
import { createWeightedPath } from "@/utils/path";

/**
 * Sorting goal properties by importance.
 *
 * @param first - first property to compare
 * @param second - second property to compare
 * @returns comparator result for properties based on importance
 */
export function goalComparator(first: IProperty, second: IProperty): number {
  return (second.importance ?? -1) - (first.importance ?? -1);
}

/**
 * Function for extracting all actions from a provided path.
 *
 * @param path - the Path from which the actions are being extracted
 * @param start - the starting node needs to be known as it contains no action
 * @param end - the end node needs to be known since it contains no action
 * @returns a queue in which all actions from the given path are listed
 */
export function extractActionsFromGraphPath(
  path: IPath<GraphNode>,
  start: GraphNode,
  end: GraphNode
): Array<AbstractAction> {
  const actions: Array<AbstractAction> = [];

  for (const node of path.vertices) {
    if (node !== start && node !== end) {
      actions.push(node.action as AbstractAction);
    }
  }

  return actions;
}

/**
 * Function for adding a new node to a given path.
 * The new node is added to a sublist of the provided path vertices, new node considered new path end.
 * Is immutable and creates new path.
 *
 * @param graph - the graph the path is located in
 * @param path - the path to which a node is being added
 * @param node - the node which shall be added
 * @return a new path with a given node as the end element, updated vertices, edges and weight
 */
export function addNodeToGraphPathEnd<T>(
  graph: IWeightedGraph<T>,
  path: IWeightedPath<T>,
  node: T
): Optional<IWeightedPath<T>> {
  return createWeightedPath(
    graph,
    path.start,
    node,
    // Add new node to the end.
    [...path.vertices, node],
    // Link path end and new node.
    [...path.edges, graph.getEdge(path.end, node) as IWeightedEdge]
  );
}

/**
 * Function for testing if all preconditions in a given set are also in another set (effects) with the same values.
 *
 * @param preconditions - set of states which are present
 * @param effects - set of states which are required
 * @return if all preconditions are met with the given effects
 */
export function areAllPreconditionsMet(preconditions: Readonly<Properties>, effects: Readonly<Properties>): boolean {
  for (const precondition of preconditions) {
    let currentPreconditionMet: boolean = false;

    for (const effect of effects) {
      if (precondition.id === effect.id) {
        if (precondition.value === effect.value) {
          currentPreconditionMet = true;
          break;
        } else {
          return false;
        }
      }
    }

    if (!currentPreconditionMet) {
      return false;
    }
  }

  return true;
}
