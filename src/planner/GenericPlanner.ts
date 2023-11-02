import { DirectedWeightedGraph, IWeightedEdge, IWeightedGraph } from "@/graph";
import { AbstractPlanner } from "@/planner/AbstractPlanner";
import { GraphNode } from "@/planner/GraphNode";

/**
 * The default implementation of the GOAP planner.
 */
export class GenericPlanner extends AbstractPlanner {
  protected override createBaseGraph<EdgeType extends IWeightedEdge>(): IWeightedGraph<GraphNode, EdgeType> {
    return new DirectedWeightedGraph<GraphNode, EdgeType>();
  }
}
