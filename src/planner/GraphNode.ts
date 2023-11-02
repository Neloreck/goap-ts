import { AbstractAction } from "@/AbstractAction";
import { Properties } from "@/alias";
import { IWeightedPath } from "@/graph/IWeightedPath";
import { Optional } from "@/types";
import { removeFromArray } from "@/utils/array";

/**
 * Vertex on the used in graph for building of paths.
 */
export class GraphNode {
  public action: Optional<AbstractAction>;
  public preconditions: Properties;
  public effects: Properties;

  public readonly pathsToThisNode: Array<IWeightedPath<GraphNode>> = [];
  public readonly states: Map<IWeightedPath<GraphNode>, Properties> = new Map();

  /**
   * @param preconditions - the set of preconditions the node has,
   *   each precondition has to be met before another node can be connected to this node
   * @param effects - the set of effects the node has on the graph,
   *   effects get added together along the graph to hopefully meet a goalState
   * @param action - action needed to perform for reaching of next state
   */
  public constructor(preconditions: Properties, effects: Properties, action: Optional<AbstractAction> = null) {
    this.preconditions = preconditions;
    this.effects = effects;
    this.action = action;
  }

  /**
   * Function for inserting existing new values and overriding current data.
   *
   * @param preconditions - the set of preconditions the node has,
   *   each precondition has to be met before another node can be connected to this node
   * @param effects - the set of effects the node has on the graph,
   *   effects get added together along the graph to hopefully meet a goalState
   * @param action - action needed to perform for reaching of next state
   * @returns this
   */
  public apply(preconditions: Properties, effects: Properties, action: Optional<AbstractAction> = null): typeof this {
    this.preconditions = preconditions;
    this.effects = effects;
    this.action = action;

    return this;
  }

  /**
   * Function for adding paths to a node so that the order in which the node is accessed is saved (Important!).
   * If these would not be stored invalid orders of actions could be added to the graph as a node can return multiple
   * access paths.
   *
   * @param pathToPreviousNode - the path with which the previous node is accessed
   * @param newPath - the path with which the node is accessed
   */
  public addGraphPath(pathToPreviousNode: Optional<IWeightedPath<GraphNode>>, newPath: IWeightedPath<GraphNode>): void {
    const newPathNodeList: Array<GraphNode> = newPath.vertices;
    let notInSet: boolean = true;

    if (this.pathsToThisNode.length) {
      for (const path of this.pathsToThisNode) {
        const nodeList: Array<GraphNode> = path.vertices;
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
    } else {
      notInSet = true;
    }

    if (notInSet) {
      this.pathsToThisNode.push(newPath);

      if (newPath.end.action !== null) {
        this.states.set(newPath, this.addPathEffectsTogether(pathToPreviousNode, newPath));
      }
    }
  }

  /**
   * Function for adding all effects in a path together to get the effect at the last node in the path.
   *
   * @param pathToPreviousNode - to the previous node so that not all effects need to be added together again and again.
   *   The reference to this is the key in the last elements storedPathEffects map
   * @param path - the path on which all effects are getting added together
   * @returns the set of effects at the last node in the path
   */
  protected addPathEffectsTogether(
    pathToPreviousNode: Optional<IWeightedPath<GraphNode>>,
    path: IWeightedPath<GraphNode>
  ): Properties {
    const statesToBeRemoved: Properties = [];

    // No path leading to the previous node = node is starting point => sublist of all effects.
    const combinedNodeEffects: Properties = pathToPreviousNode
      ? [...(pathToPreviousNode.end.states.get(pathToPreviousNode) as Properties)]
      : [...path.start.effects];

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
}
