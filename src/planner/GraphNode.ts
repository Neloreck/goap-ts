import { AbstractAction } from "@/AbstractAction";
import { Properties } from "@/alias";
import { IWeightedPath } from "@/graph/IWeightedPath";
import { Optional } from "@/types";
import { mergePathEffectsTogether } from "@/utils/path";

/**
 * Vertex on the used in graph for building of paths.
 * Represent node describing graph paths/vertices with readonly availability.
 */
export class GraphNode {
  public action: Optional<AbstractAction>;
  public preconditions: Readonly<Properties>;
  public effects: Readonly<Properties>;

  public readonly pathsToThisNode: Array<IWeightedPath<GraphNode>> = [];
  public readonly states: Map<IWeightedPath<GraphNode>, Readonly<Properties>> = new Map();

  /**
   * @param preconditions - the set of preconditions the node has,
   *   each precondition has to be met before another node can be connected to this node
   * @param effects - the set of effects the node has on the graph,
   *   effects get added together along the graph to hopefully meet a goalState
   * @param action - action needed to perform for reaching of next state
   */
  public constructor(
    preconditions: Readonly<Properties>,
    effects: Readonly<Properties>,
    action: Optional<Readonly<AbstractAction>> = null
  ) {
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
  public apply(
    preconditions: Readonly<Properties>,
    effects: Readonly<Properties>,
    action: Optional<AbstractAction> = null
  ): typeof this {
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
   * @param pathToThisNode - the path with which the node is accessed
   */
  public addGraphPath(
    pathToPreviousNode: Optional<IWeightedPath<GraphNode>>,
    pathToThisNode: IWeightedPath<GraphNode>
  ): void {
    const newPathNodeList: Array<GraphNode> = pathToThisNode.vertices;
    let notInSet: boolean = true;

    if (this.pathsToThisNode.length) {
      for (const path of this.pathsToThisNode) {
        const nodeList: Array<GraphNode> = path.vertices;
        let isSamePath: boolean = true;

        for (let i = 0; i < nodeList.length; i++) {
          if (nodeList[i] !== newPathNodeList[i]) {
            isSamePath = false;
            break;
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
      this.pathsToThisNode.push(pathToThisNode);

      if (pathToThisNode.end.action !== null) {
        this.states.set(
          pathToThisNode,
          mergePathEffectsTogether(
            // Has previous path -> get effects from it, otherwise -> get current node effects
            pathToPreviousNode
              ? (pathToPreviousNode.end.states.get(pathToPreviousNode) as Properties)
              : pathToThisNode.start.effects,
            this.effects
          )
        );
      }
    }
  }
}
