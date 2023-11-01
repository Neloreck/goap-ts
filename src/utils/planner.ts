import { AbstractAction } from "@/AbstractAction";
import { GraphNode } from "@/planner/GraphNode";
import { Property } from "@/Property";
import { Optional } from "@/types";
import { IWeightedGraph, Path, WeightedEdge, WeightedPath } from "@/utils/graph";
import { createWeightedPath } from "@/utils/path";

/**
 * Function for extracting all actions from a path.
 *
 * @param path - the Path from which the actions are being extracted
 * @param start - the starting node needs to be known as it contains no action
 * @param end - the end node needs to be known since it contains no action
 * @returns a queue in which all actions from the given path are listed
 */
export function extractActionsFromGraphPath(
  path: Path<GraphNode, WeightedEdge>,
  start: GraphNode,
  end: GraphNode
): Array<AbstractAction> {
  const queue: Array<AbstractAction> = [];

  for (const node of path.getVertexList()) {
    if (node !== start && node !== end) {
      queue.push(node.action as AbstractAction);
    }
  }

  return queue;
}

/**
 * Function for adding a new node to a given GraphPath. The new node is
 * added to a sublist of the provided path vertexSet.
 *
 * @param graph - the graph the path is located in
 * @param baseGraphPath - the path to which a node is being added
 * @param nodeToAdd - the node which shall be added
 * @return a graphPath with a given node as the end element, updated vertexSet, edgeSet and weight
 */
export function addNodeToGraphPath(
  graph: IWeightedGraph<GraphNode, WeightedEdge>,
  baseGraphPath: WeightedPath<GraphNode, WeightedEdge>,
  nodeToAdd: GraphNode
): Optional<WeightedPath<GraphNode, WeightedEdge>> {
  const vertices: Array<GraphNode> = Array.from(baseGraphPath.getVertexList());
  const edges: Array<WeightedEdge> = Array.from(baseGraphPath.getEdgeList());

  vertices.push(nodeToAdd);
  edges.push(graph.getEdge(baseGraphPath.getEndVertex(), nodeToAdd) as WeightedEdge);

  return createWeightedPath(graph, baseGraphPath.getStartVertex(), nodeToAdd, vertices, edges);
}

/**
 * Function for testing if all preconditions in a given set are also in another set (effects) with the same values.
 *
 * @param preconditions - set of states which are present
 * @param effects - set of states which are required
 * @return if all preconditions are met with the given effects
 */
export function areAllPreconditionsMet(preconditions: Array<Property>, effects: Array<Property>): boolean {
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
