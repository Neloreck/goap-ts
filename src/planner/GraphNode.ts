import { AbstractAction } from "@/AbstractAction";
import { Property } from "@/Property";
import { Optional } from "@/types";
import { removeFromArray } from "@/utils/array";
import { WeightedEdge, WeightedPath } from "@/utils/graph";

/**
 * Vertex on the used in graph for building of paths.
 */
export class GraphNode {
  public action: Optional<AbstractAction>;
  public preconditions: Array<Property>;
  public effects: Array<Property>;

  public pathsToThisNode: Array<WeightedPath<GraphNode, WeightedEdge>> = [];
  private states: Map<WeightedPath<GraphNode, WeightedEdge>, Array<Property>> = new Map();

  /**
   * @param preconditions - the set of preconditions the node has,
   *   each precondition has to be met before another node can be connected to this node
   * @param effects - the set of effects the node has on the graph,
   *   effects get added together along the graph to hopefully meet a goalState
   * @param action - action needed to perform for reaching of next state
   */
  public constructor(
    preconditions: Array<Property>,
    effects: Array<Property>,
    action: Optional<AbstractAction> = null
  ) {
    this.preconditions = preconditions;
    this.effects = effects;
    this.action = action;
  }

  /**
   * Function for inserting existing GraphNodes values into the current one.
   *
   * @param node - the node whose properties are going to be copied
   */
  public copyFrom(node: GraphNode): void {
    this.action = node.action;
    this.preconditions = node.preconditions;
    this.effects = node.effects;
  }

  /**
   * Function for adding paths to a node so that the order in which the node is accessed is saved (Important!).
   * If these would not be stored invalid orders of actions could be added to the graph as a node can return multiple
   * access paths.
   *
   * @param pathToPreviousNode - the path with which the previous node is accessed
   * @param newPath - the path with which the node is accessed
   */
  public addGraphPath(
    pathToPreviousNode: Optional<WeightedPath<GraphNode, WeightedEdge>>,
    newPath: WeightedPath<GraphNode, WeightedEdge>
  ): void {
    const newPathNodeList: Array<GraphNode> = newPath.getVertexList();
    let notInSet: boolean = true;

    if (this.pathsToThisNode.length === 0) {
      notInSet = true;
    } else {
      for (const storedPath of this.pathsToThisNode) {
        const nodeList: Array<GraphNode> = storedPath.getVertexList();
        let isSamePath: boolean = true;

        for (let i = 0; i < nodeList.length && isSamePath; i++) {
          if (nodeList[i] !== newPathNodeList[i]) {
            isSamePath = false;
          }
        }

        if (isSamePath) {
          notInSet = false;

          break;
        }
      }
    }

    if (notInSet) {
      this.pathsToThisNode.push(newPath);

      if (newPath.getEndVertex().action !== null) {
        this.states.set(newPath, this.addPathEffectsTogether(pathToPreviousNode, newPath));
      }
    }
  }

  /**
   * Function for adding all effects in a path together to get the effect at the last node in the path.
   *
   * @param pathToPreviousNode - to the previous node so that not all effects need to be added together again and again.
   *   The reference to this is the key in the last elements storedPathEffects HashTable
   * @param path - the path on which all effects are getting added together
   * @returns the set of effects at the last node in the path
   */
  private addPathEffectsTogether(
    pathToPreviousNode: Optional<WeightedPath<GraphNode, WeightedEdge>>,
    path: WeightedPath<GraphNode, WeightedEdge>
  ): Array<Property> {
    const statesToBeRemoved: Array<Property> = [];

    // No path leading to the previous node = node is starting point => sublist of all effects.
    const combinedNodeEffects: Array<Property> =
      pathToPreviousNode === null
        ? Array.from(path.getStartVertex().effects)
        : Array.from(pathToPreviousNode.getEndVertex().getEffectState(pathToPreviousNode));

    // Mark effects to be removed.
    for (const nodeWorldState of combinedNodeEffects) {
      for (const pathNodeEffect of this.effects) {
        if (nodeWorldState.id === pathNodeEffect.id) {
          statesToBeRemoved.push(nodeWorldState);
        }
      }
    }

    // Remove marked effects from the state.
    for (const state of statesToBeRemoved) {
      removeFromArray(combinedNodeEffects, state);
    }

    return combinedNodeEffects.concat(this.effects);
  }

  /**
   * @param path - path to get effects state for
   * @returns effects for provided path
   */
  public getEffectState(path: WeightedPath<GraphNode, WeightedEdge>): Array<Property> {
    return this.states.get(path) as Array<Property>;
  }
}
