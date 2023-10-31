import { Action } from "@/Action";
import { GraphNode } from "@/planner/GraphNode";
import { State } from "@/State";
import { Optional, Queue } from "@/types";
import { IUnit } from "@/unit/IUnit";
import { IWeightedGraph, PathFactory, WeightedEdge, WeightedPath } from "@/utils/graph";

/**
 * Class for generating a queue of goap actions.
 */
export abstract class AbstractPlanner {
  private unit: IUnit;

  private startNode: GraphNode;
  private endNodes: Array<GraphNode>;

  protected abstract generateGraphObject<EdgeType extends WeightedEdge>(): IWeightedGraph<GraphNode, EdgeType>;

  /**
   * Generate a plan (Queue of GoapActions) which is then performed by the
   * assigned GoapUnit. A search algorithm is not needed as each node contains
   * each path to itself. Therefore each goal contains a list of paths leading
   * starting from the worldState through multiple node directly to it. The
   * goals and their paths can be sorted according to these and the importance
   * of each goal with the weight provided by each node inside the graph.
   *
   * @param unit - the GOAP planner unit the plan gets generated for
   * @returns a generated plan (queue) of actions, that the unit has to perform to achieve the desired state OR null,
   *   if no plan was generated
   */
  public plan(unit: IUnit): Queue<Action> {
    let createdPlan: Queue<Action> = null;

    this.unit = unit;
    this.startNode = new GraphNode(null);
    this.endNodes = [];

    try {
      this.sortGoalStates();

      // The Integer.MaxValue indicates that the goal was passed by the changeGoalImmediatly function.
      // An empty Queue is returned instead of null because null would result in the IdleState to call this
      // function again. An empty Queue is finished in one cycle with no effect at all.
      if (this.unit.getGoalState()[0].importance === Infinity) {
        const goalState: Array<State> = [this.unit.getGoalState()[0]];

        createdPlan = this.searchGraphForActionQueue(this.createGraph(goalState));

        if (createdPlan === null) {
          createdPlan = [];
        }

        this.unit.getGoalState().shift();
      } else {
        createdPlan = this.searchGraphForActionQueue(this.createGraph());
      }
    } catch (error) {
      // e.printStackTrace();
      // todo: handle error
    }

    return createdPlan;
  }

  protected getUnit(): IUnit {
    return this.unit;
  }

  protected getStartNode(): GraphNode {
    return this.startNode;
  }

  protected getEndNodes(): Array<GraphNode> {
    return this.endNodes;
  }

  /**
   * Function for sorting a units goalStates (descending). The most important goal has the highest importance value.
   *
   * @return the sorted goal list of the unit
   */
  protected sortGoalStates(): Array<State> {
    return this.unit.getGoalState().sort((first, second) => first.importance - second.importance);
  }

  /**
   * Function to create a graph based on all possible unit actions of the GoapUnit for (a) specific goal/-s.
   *
   * @param goalState - list of states the action queue has to fulfill
   * @returns a DirectedWeightedGraph generated from all possible unit actions for a goal
   */
  protected createGraph(goalState: Array<State> = this.unit.getGoalState()): IWeightedGraph<GraphNode, WeightedEdge> {
    const generatedGraph: IWeightedGraph<GraphNode, WeightedEdge> = this.generateGraphObject();

    this.addVertices(generatedGraph, goalState);
    this.addEdges(generatedGraph);

    return generatedGraph;
  }

  /**
   * Function for adding vertices to a graph.
   *
   * @param graph - the graph the vertices are being added to
   * @param goalState - list of States the unit has listed as their goals
   */
  protected addVertices(graph: IWeightedGraph<GraphNode, WeightedEdge>, goalState: Array<State>): void {
    // The effects from the world state as well as the precondition of each
    // goal have to be set at the beginning, since these are the effects the
    // unit tries to archive with its actions. Also the startNode has to
    // overwrite the existing GraphNode as an initialization of a new Object
    // would not be reflected to the function caller.
    const start: GraphNode = new GraphNode(null, this.unit.getWorldState());

    this.startNode.overwriteFrom(start);
    graph.addVertex(this.startNode);

    for (const state of goalState) {
      const goalStateHash: Set<State> = new Set();

      goalStateHash.add(state);

      const end: GraphNode = new GraphNode(goalStateHash, null);

      graph.addVertex(end);
      this.endNodes.push(end);
    }

    // Afterward all other possible actions have to be added as well.
    for (const action of this.extractPossibleActions()) {
      graph.addVertex(new GraphNode(action));
    }
  }

  /**
   * Needed to check if the available actions can actually be performed
   *
   * @return all possible actions which are actually available for the unit.
   */
  protected extractPossibleActions(): Set<Action> {
    const possibleActions: Set<Action> = new Set();

    try {
      for (const action of this.unit.getAvailableActions()) {
        if (action.checkProceduralPrecondition(this.unit)) {
          possibleActions.add(action);
        }
      }
    } catch (error) {
      // e.printStackTrace();
      // todo: Print error
    }

    return possibleActions;
  }

  /**
   * Function for adding (all) edges in the provided graph based on the
   * GoapUnits actions and their combined effects along the way. The way this
   * is archived is by first adding all default nodes, whose preconditions are
   * met by the effect of the beginning state (worldState). All further
   * connections base on these first connected nodes in the Queue. Elements
   * connected are getting added to a Queue which is then being worked on.
   *
   * @param graph - the graph the edges are being added to.
   */
  protected addEdges(graph: IWeightedGraph<GraphNode, WeightedEdge>): void {
    const nodesToWorkOn: Queue<GraphNode> = [];

    this.addDefaultEdges(graph, nodesToWorkOn);

    // Check each already connected once node against all other nodes to
    // find a possible match between the combined effects of the path + the
    // worldState and the preconditions of the current node.
    while (nodesToWorkOn.length > 0) {
      const node: GraphNode = nodesToWorkOn.shift();

      // Select only node to which a path can be created (-> targets!)
      if (node !== this.startNode && !this.endNodes.includes(node)) {
        this.tryToConnectNode(graph, node, nodesToWorkOn);
      }
    }
  }

  /**
   * Function for adding the edges to the graph which are the connection from
   * the starting node to all default accessible nodes (= actions). These
   * nodes either have no precondition or their preconditions are all in the
   * effect HashSet of the starting node. These default edges are needed since
   * all further connections rely on them as nodes in the further steps are
   * not allowed to connect to the starting node anymore.
   *
   * @param graph - the graph the edges are getting added to
   * @param nodesToWorkOn - the Queue in which nodes which got connected are getting added to
   */
  protected addDefaultEdges(graph: IWeightedGraph<GraphNode, WeightedEdge>, nodesToWorkOn: Queue<GraphNode>): void {
    // graphNode.action != null -> start and ends
    for (const graphNode of graph.getVertices()) {
      if (
        this.startNode !== graphNode &&
        graphNode.action !== null &&
        (graphNode.preconditions.size === 0 ||
          AbstractPlanner.areAllPreconditionsMet(graphNode.preconditions, this.startNode.effects))
      ) {
        AbstractPlanner.addEgdeWithWeigth(graph, this.startNode, graphNode, new WeightedEdge(), 0);

        if (!nodesToWorkOn.includes(graphNode)) {
          nodesToWorkOn.push(graphNode);
        }

        // Add the path to the node to the GraphPath list in the node
        // since this is the first step inside the graph.
        const graphPathToDefaultNode: WeightedPath<GraphNode, WeightedEdge> = PathFactory.generateWeightedPath(
          graph,
          this.startNode,
          graphNode,
          [this.startNode, graphNode],
          [graph.getEdge(this.startNode, graphNode)]
        );

        graphNode.addGraphPath(null, graphPathToDefaultNode);
      }
    }
  }

  /**
   * Function for testing if all preconditions in a given set are also in another set (effects) with the same values.
   *
   * @param preconditions - HashSet of states which are present.
   * @param effects - HashSet of states which are required.
   * @return if all preconditions are met with the given effects
   */
  protected static areAllPreconditionsMet(preconditions: Set<State>, effects: Set<State>): boolean {
    let preconditionsMet: boolean = true;

    for (const precondition of preconditions) {
      let currentPreconditionMet: boolean = false;

      for (const effect of effects) {
        if (precondition.effect === effect.effect) {
          if (precondition.value === effect.value) {
            currentPreconditionMet = true;
          } else {
            preconditionsMet = false;
          }
        }
      }

      if (!preconditionsMet || !currentPreconditionMet) {
        preconditionsMet = false;

        break;
      }
    }

    return preconditionsMet;
  }

  /**
   * Convenience function for adding a weighted edge to an existing Graph.
   *
   * @param graph
   *            the Graph the edge is added to.
   * @param firstVertex
   *            start vertex.
   * @param secondVertex
   *            target vertex.
   * @param edge
   *            edge reference.
   * @param weight
   *            the weight of the edge being created.
   * @return true or false depending if the creation of the edge was
   *         successful or not.
   */
  protected static addEgdeWithWeigth<V, E extends WeightedEdge>(
    graph: IWeightedGraph<V, E>,
    firstVertex: V,
    secondVertex: V,
    edge: E,
    weight: number
  ): boolean {
    try {
      graph.addEdge(firstVertex, secondVertex, edge);
      graph.setEdgeWeight(graph.getEdge(firstVertex, secondVertex), weight);

      return true;
    } catch (error) {
      // e.printStackTrace();

      return false;
    }
  }

  /**
   * Function for trying to connect a given node to all other nodes in the
   * graph besides the starting node.
   *
   * @param graph
   *            the graph in which the provided nodes are located.
   * @param node
   *            the node which is being connected to another node.
   * @param nodesToWorkOn
   *            the Queue to which any connected nodes are being added to work
   *            on these connections in further iterations.
   * @return true or false depending on if the node was connected to another
   *         node.
   */
  protected tryToConnectNode(
    graph: IWeightedGraph<GraphNode, WeightedEdge>,
    node: GraphNode,
    nodesToWorkOn: Queue<GraphNode>
  ): boolean {
    let connected: boolean = false;

    for (const otherNodeInGraph of graph.getVertices()) {
      // End nodes can not have a edge towards another node and the target
      // node must not be itself. Also there must not already be an edge
      // in the graph.
      // && !graph.containsEdge(node, nodeInGraph) has to be added
      // or loops occur which lead to a crash. This leads to the case
      // where no
      // alternative routes are being stored inside the pathsToThisNode
      // list. This is because of the use of a Queue, which loses the
      // memory of which nodes were already connected.
      if (
        node !== otherNodeInGraph &&
        this.startNode !== otherNodeInGraph &&
        !graph.containsEdge(node, otherNodeInGraph)
      ) {
        // Every saved path to this node is checked if any of these
        // produce a suitable effect set regarding the preconditions of
        // the current node.
        for (const pathToListNode of node.pathsToThisNode) {
          if (
            AbstractPlanner.areAllPreconditionsMet(otherNodeInGraph.preconditions, node.getEffectState(pathToListNode))
          ) {
            connected = true;

            AbstractPlanner.addEgdeWithWeigth(
              graph,
              node,
              otherNodeInGraph,
              new WeightedEdge(),
              node.action.generateCost(this.unit)
            );

            otherNodeInGraph.addGraphPath(
              pathToListNode,
              AbstractPlanner.addNodeToGraphPath(graph, pathToListNode, otherNodeInGraph)
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
   * Function for adding a new node to a given GraphPath. The new node is
   * added to a sublist of the provided path vertexSet.
   *
   * @param graph - the graph the path is located in
   * @param baseGraphPath - the path to which a node is being added
   * @param nodeToAdd - the node which shall be added
   * @return a graphPath with a given node as the end element, updated vertexSet, edgeSet and weight
   */
  protected static addNodeToGraphPath(
    graph: IWeightedGraph<GraphNode, WeightedEdge>,
    baseGraphPath: WeightedPath<GraphNode, WeightedEdge>,
    nodeToAdd: GraphNode
  ): WeightedPath<GraphNode, WeightedEdge> {
    const vertices: Array<GraphNode> = Array.from(baseGraphPath.getVertexList());
    const edges: Array<WeightedEdge> = Array.from(baseGraphPath.getEdgeList());

    vertices.push(nodeToAdd);
    edges.push(graph.getEdge(baseGraphPath.getEndVertex(), nodeToAdd));

    return PathFactory.generateWeightedPath(graph, baseGraphPath.getStartVertex(), nodeToAdd, vertices, edges);
  }

  /**
   * Function for searching a graph for the lowest cost of a series of actions
   * which have to be taken to archive a certain goal which has most certainly
   * the highest importance.
   *
   * @param graph - the graph of goap actions the unit has to take in order to achieve a goal
   * @returns the Queue of goap actions which has the lowest cost to archive a goal
   */
  protected searchGraphForActionQueue(graph: IWeightedGraph<GraphNode, WeightedEdge>): Optional<Queue<Action>> {
    for (let i = 0; i < this.endNodes.length; i++) {
      AbstractPlanner.sortPathsLeadingToNode(this.endNodes[i]);

      for (let j = 0; j < this.endNodes[i].pathsToThisNode.length; j++) {
        return AbstractPlanner.extractActionsFromGraphPath(
          this.endNodes[i].pathsToThisNode[j],
          this.startNode,
          this.endNodes[i]
        );
      }
    }

    return null;
  }

  /**
   * Sorting function for the paths leading to a node based on their combined edge weights (ascending).
   *
   * @param node - the node whose paths leading to it are being sorted
   */
  protected static sortPathsLeadingToNode(node: GraphNode): void {
    node.pathsToThisNode.sort((first, second) => first.getTotalWeight() - second.getTotalWeight());
  }

  /**
   * Function for extracting all Actions from a GraphPath.
   *
   * @param path - the Path from which the actions are being extracted.
   * @param startNode - the starting node needs to be known as it contains no action.
   * @param endNode - the end node needs to be known since it contains no action.
   * @returns a queue in which all actions from the given path are listed
   */
  protected static extractActionsFromGraphPath(
    path: WeightedPath<GraphNode, WeightedEdge>,
    startNode: GraphNode,
    endNode: GraphNode
  ): Queue<Action> {
    const actionQueue: Queue<Action> = [];

    for (const node of path.getVertexList()) {
      if (node !== startNode && node !== endNode) {
        actionQueue.push(node.action);
      }
    }

    return actionQueue;
  }
}
