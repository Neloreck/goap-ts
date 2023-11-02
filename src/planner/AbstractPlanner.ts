import { IWeightedEdge, IWeightedGraph } from "src/graph";

import { AbstractAction } from "@/AbstractAction";
import { Plan, Properties } from "@/alias";
import { IErrorHandler, SilentErrorHandler } from "@/error";
import { IWeightedPath } from "@/graph/IWeightedPath";
import { GraphNode } from "@/planner/GraphNode";
import { Optional, Queue } from "@/types";
import { IUnit } from "@/unit/IUnit";
import { createWeightedPath } from "@/utils/path";
import {
  addNodeToGraphPathEnd,
  areAllPreconditionsMet,
  extractActionsFromGraphPath,
  goalComparator,
} from "@/utils/planner";

/**
 * Class for generating a queue of goap actions.
 */
export abstract class AbstractPlanner {
  protected unit: IUnit;
  protected startNode: GraphNode;
  protected endNodes: Array<GraphNode>;

  protected errorHandler: IErrorHandler;

  /**
   * @param errorHandler - class handling planner errors
   */
  public constructor(errorHandler: IErrorHandler = new SilentErrorHandler()) {
    this.errorHandler = errorHandler;
  }

  /**
   * @return unit with which planner is working
   */
  public getUnit(): IUnit {
    return this.unit;
  }

  /**
   * @return start node of the planner path
   */
  public getStartNode(): GraphNode {
    return this.startNode;
  }

  /**
   * @return end nodes after planning
   */
  public getEndNodes(): Array<GraphNode> {
    return this.endNodes;
  }

  /**
   * Method to generate base graph used for plan building.
   */
  protected abstract createBaseGraph<EdgeType extends IWeightedEdge>(): IWeightedGraph<GraphNode, EdgeType>;

  /**
   * Generate a plan (Queue of GoapActions) which is then performed by the assigned unit. A search algorithm is not
   * needed as each node contains each path to itself. Therefore, each goal contains a list of paths leading starting
   * from the worldState through multiple node directly to it. The goals and their paths can be sorted according to
   * these and the importance of each goal with the weight provided by each node inside the graph.
   *
   * @param unit - the GOAP planner unit the plan gets generated for
   * @returns a generated plan (queue) of actions, that the unit has to perform to achieve the desired state OR null,
   *   if no plan was generated
   */
  public plan(unit: IUnit): Optional<Queue<AbstractAction>> {
    // Reset previous planning data.
    this.unit = unit;
    this.startNode = new GraphNode([], []);
    this.endNodes = [];

    try {
      const goal: Properties = this.unit.getGoalState().sort(goalComparator);

      // The Integer.MaxValue indicates that the goal was passed by the changeGoalImmediatly function.
      // An empty Queue is returned instead of null because null would result in the IdleState to call this
      // function again. An empty Queue is finished in one cycle with no effect at all.
      // todo: Probably review this logics.
      if (goal[0].importance === Infinity) {
        const createdPlan: Optional<Queue<AbstractAction>> = this.searchGraphForActionQueue(
          this.createGraph([goal[0]])
        );

        goal.shift();

        return createdPlan ?? [];
      } else {
        return this.searchGraphForActionQueue(this.createGraph(this.unit.getGoalState()));
      }
    } catch (error) {
      this.errorHandler.onError(error, "planner_plan_error");
    }

    return null;
  }

  /**
   * Function to create a graph based on all possible unit actions of the GoapUnit for (a) specific goal/-s.
   *
   * @param goalState - list of states the action queue has to fulfill
   * @returns a directed weighted graph generated from all possible unit actions for a goal
   */
  protected createGraph(goalState: Properties): IWeightedGraph<GraphNode> {
    const generatedGraph: IWeightedGraph<GraphNode> = this.createBaseGraph();

    this.addVertices(generatedGraph, goalState);
    this.addEdges(generatedGraph);

    return generatedGraph;
  }

  /**
   * Function for adding vertices to a graph.
   *
   * Current state is start node.
   * Goal states are end nodes.
   * Each action is separate vertex.
   *
   * @param graph - the graph the vertices are being added to
   * @param goals - list of properties the unit has listed as their goals
   */
  protected addVertices(graph: IWeightedGraph<GraphNode>, goals: Properties): void {
    // The effects from the world state as well as the precondition of each goal have to be set at the beginning,
    // since these are the effects the unit tries to archive with its actions. Also, the startNode has to overwrite
    // the existing GraphNode as an initialization of a new Object would not be reflected to the function caller.

    // Beginning of the graph.
    graph.addVertex(this.startNode.apply([], this.unit.getWorldState()));

    // End points of the graph.
    for (const goal of goals) {
      const end: GraphNode = new GraphNode([goal], []);

      graph.addVertex(end);
      this.endNodes.push(end);
    }

    // All actions are separate vertices to reach goals.
    for (const action of this.getPossibleActions()) {
      graph.addVertex(new GraphNode(action.preconditions, action.effects, action));
    }
  }

  /**
   * Needed to check if the available actions can actually be performed.
   *
   * @return all possible actions which are actually available for the unit
   */
  protected getPossibleActions(): Array<AbstractAction> {
    try {
      return this.unit.getActions().filter((it) => it.isAvailable(this.unit));
    } catch (error) {
      this.errorHandler.onError(error, "planner_get_possible_actions_error");

      return [];
    }
  }

  /**
   * Function for adding (all) edges in the provided graph based on the unit actions and their combined effects along
   * the way. The way this is archived is by first adding all default nodes, whose preconditions are met by the effect
   * of the beginning state (worldState). All further connections base on these first connected nodes in the queue.
   * Elements connected are getting added to a Queue which is then being worked on.
   *
   * @param graph - the graph the edges are being added to
   */
  protected addEdges(graph: IWeightedGraph<GraphNode>): void {
    const nodesToWorkOn: Array<GraphNode> = this.createBaseEdges(graph);

    // Check each already connected once node against all other nodes to
    // find a possible match between the combined effects of the path + the
    // worldState and the preconditions of the current node.
    while (nodesToWorkOn.length > 0) {
      const node: GraphNode = nodesToWorkOn.pop() as GraphNode;

      // Select only node to which a path can be created (-> targets!)
      if (node !== this.startNode && this.endNodes.indexOf(node) === -1) {
        this.tryToConnectNode(graph, node, nodesToWorkOn);
      }
    }
  }

  /**
   * Function for adding the edges to the graph which are the connection from the starting node to all default
   * accessible nodes (= actions). These nodes either have no precondition or their preconditions are all in the
   * effect HashSet of the starting node. These default edges are needed since all further connections rely on them
   * as nodes in the further steps are not allowed to connect to the starting node anymore.
   *
   * @param graph - the graph the edges are getting added to
   */
  protected createBaseEdges(graph: IWeightedGraph<GraphNode>): Array<GraphNode> {
    const nodesToWorkOn: Array<GraphNode> = [];

    // graphNode.action != null -> start and ends
    for (const node of graph) {
      if (
        this.startNode !== node &&
        node.action !== null &&
        (!node.preconditions.length || areAllPreconditionsMet(node.preconditions, this.startNode.effects))
      ) {
        graph.addEdge(this.startNode, node, { weight: 0 });

        if (!nodesToWorkOn.includes(node)) {
          nodesToWorkOn.push(node);
        }

        // Add the path to the node to the GraphPath list in the node
        // since this is the first step inside the graph.
        node.addGraphPath(
          null,
          createWeightedPath(
            graph,
            this.startNode,
            node,
            [this.startNode, node],
            [graph.getEdge(this.startNode, node) as IWeightedEdge]
          ) as IWeightedPath<GraphNode>
        );
      }
    }

    return nodesToWorkOn;
  }

  /**
   * Function for trying to connect a given node to all other nodes in the
   * graph besides the starting node.
   *
   * @param graph - the graph in which the provided nodes are located
   * @param node - the node which is being connected to another node
   * @param nodesToWorkOn - the queue to which any connected nodes are being added to work on these connections in
   *   further iterations
   * @return if the node was connected to another node
   */
  protected tryToConnectNode(
    graph: IWeightedGraph<GraphNode>,
    node: GraphNode,
    nodesToWorkOn: Queue<GraphNode>
  ): boolean {
    let connected: boolean = false;

    for (const otherNodeInGraph of graph) {
      // End nodes can not have an edge towards another node and the target node must not be itself.
      // Also, there must not already be an edge in the graph.
      // && !graph.hasEdge(node, nodeInGraph) has to be added or loops occur which lead to a crash.
      // This leads to the case where no alternative routes are being stored inside the pathsToThisNode list.
      // This is because of the use of a queue, which loses the memory of which nodes were already connected.
      if (node !== otherNodeInGraph && this.startNode !== otherNodeInGraph && !graph.hasEdge(node, otherNodeInGraph)) {
        // Every saved path to this node is checked if any of these
        // produce a suitable effect set regarding the preconditions of
        // the current node.
        for (const pathToListNode of node.pathsToThisNode) {
          if (areAllPreconditionsMet(otherNodeInGraph.preconditions, node.states.get(pathToListNode) as Properties)) {
            connected = true;

            graph.addEdge(node, otherNodeInGraph, { weight: (node.action as AbstractAction).generateCost(this.unit) });

            otherNodeInGraph.addGraphPath(
              pathToListNode,
              addNodeToGraphPathEnd(graph, pathToListNode, otherNodeInGraph) as IWeightedPath<GraphNode>
            );

            nodesToWorkOn.push(otherNodeInGraph);

            // break; // TODO: Possible Change: If enabled then only
            // one Path from the currently checked node is
            // transferred to another node. All other possible Paths
            // will not be considered and not checked.
          }
        }
      }
    }

    return connected;
  }

  /**
   * Function for searching a graph for the lowest cost of a series of actions which have to be taken to archive
   * a certain goal which has most certainly the highest importance.
   *
   * @param graph - the graph of goap actions the unit has to take in order to achieve a goal
   * @returns the Queue of goap actions which has the lowest cost to archive a goal
   */
  protected searchGraphForActionQueue(graph: IWeightedGraph<GraphNode>): Optional<Plan> {
    for (const node of this.endNodes) {
      if (node.pathsToThisNode.length) {
        // Sort by cost to find the most efficient way.
        node.pathsToThisNode.sort((first, second) => first.totalWeight - second.totalWeight);

        // Get the most efficient for the most important goal.
        return extractActionsFromGraphPath(node.pathsToThisNode[0], this.startNode, node) ?? null;
      }
    }

    return null;
  }
}
