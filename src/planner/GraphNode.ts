import { Action } from "@/planner/Action";
import { State } from "@/state/State";
import { Optional } from "@/types";
import { WeightedEdge, WeightedPath } from "@/utils/graph";

/**
 * Vertex on the used in graph for building of paths.
 */
export class GraphNode {
  public action: Optional<Action> = null;

  public preconditions: Set<State>;
  public effects: Set<State>;

  public pathsToThisNode: Array<WeightedPath<GraphNode, WeightedEdge>> = [];
  private storedEffectStates: Map<WeightedPath<GraphNode, WeightedEdge>, Set<State>> = new Map();

  public constructor(action: Optional<Action>);
  public constructor(preconditions: Set<State>, effects: Set<State>);

  /**
   * @param preconditionsOrAction - the set of preconditions the node has.
   *   Each precondition has to be met before another node can be connected to this node.
   * @param effects - the set of effects the node has on the graph.
   *   Effects get added together along the graph to hopefully meet a goalState.
   */
  public constructor(preconditionsOrAction: Set<State> | Optional<Action>, effects?: Set<State>) {
    if (preconditionsOrAction instanceof Action) {
      this.preconditions = preconditionsOrAction.getPreconditions();
      this.effects = preconditionsOrAction.getEffects();
      this.action = preconditionsOrAction;
    } else {
      this.preconditions = preconditionsOrAction;
      this.effects = effects;
    }
  }

  /**
   * Function for inserting existing GraphNodes values into the current one.
   *
   * @param newGraphNode
   *            the node whose properties are going to be copied.
   */
  public overwriteOwnProperties(newGraphNode: Optional<GraphNode>): void {
    if (newGraphNode !== null) {
      this.action = newGraphNode.action;
      this.preconditions = newGraphNode.preconditions;
      this.effects = newGraphNode.effects;
    }
  }

  /**
   * Function for adding paths to a node so that the order in which the node
   * is accessed is saved (Important!). If these would not be stored invalid
   * orders of actions could be added to the graph as a node can return
   * multiple access paths!
   *
   * @param pathToPreviousNode
   *            the path with which the previous node is accessed.
   * @param newPath
   *            the path with which the node is accessed.
   */
  public addGraphPath(
    pathToPreviousNode: WeightedPath<GraphNode, WeightedEdge>,
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
        this.storedEffectStates.set(newPath, this.addPathEffectsTogether(pathToPreviousNode, newPath));
      }
    }
  }

  /**
   * Function for adding all effects in a path together to get the effect at
   * the last node in the path.
   *
   * @param pathToPreviousNode
   *            to the previous node so that not all effects need to be added
   *            together again and again. The reference to this is the key in
   *            the last elements storedPathEffects HashTable.
   * @param path
   *            the path on which all effects are getting added together.
   * @return the HashSet of effects at the last node in the path.
   */
  private addPathEffectsTogether(
    pathToPreviousNode: WeightedPath<GraphNode, WeightedEdge>,
    path: WeightedPath<GraphNode, WeightedEdge>
  ): Set<State> {
    const statesToBeRemoved: Array<State> = [];

    // No path leading to the previous node = node is starting point => sublist of all effects
    const combinedNodeEffects: Set<State> =
      pathToPreviousNode === null
        ? new Set(path.getStartVertex().effects)
        : new Set(pathToPreviousNode.getEndVertex().getEffectState(pathToPreviousNode));

    // Mark effects to be removed
    for (const nodeWorldState of combinedNodeEffects) {
      for (const pathNodeEffect of this.effects) {
        if (nodeWorldState.effect === pathNodeEffect.effect) {
          statesToBeRemoved.push(nodeWorldState);
        }
      }
    }

    // Remove marked effects from the state
    for (const stateToRemove of statesToBeRemoved) {
      combinedNodeEffects.delete(stateToRemove);
    }

    // Add all effects from the current node to the HashSet
    for (const effect of this.effects) {
      combinedNodeEffects.add(effect);
    }

    return combinedNodeEffects;
  }

  public getEffectState(pathKey: WeightedPath<GraphNode, WeightedEdge>): Set<State> {
    return this.storedEffectStates.get(pathKey);
  }
}
