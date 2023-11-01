import { AbstractPlanner } from "@/planner/AbstractPlanner";
import { GraphNode } from "@/planner/GraphNode";
import { DirectedWeightedGraph, IWeightedGraph, WeightedEdge } from "@/utils/graph";

/**
 * The default implementation of the GOAP planner.
 */
export class GenericPlanner extends AbstractPlanner {
  protected override createBaseGraph<EdgeType extends WeightedEdge>(): IWeightedGraph<GraphNode, EdgeType> {
    return new DirectedWeightedGraph<GraphNode, EdgeType>();
  }
}
