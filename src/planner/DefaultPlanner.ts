import { AbstractPlanner } from "@/planner/AbstractPlanner";
import { GraphNode } from "@/planner/GraphNode";
import { DirectedWeightedGraph, IWeightedGraph, WeightedEdge } from "@/utils/graph";

/**
 * The default implementation of the goap planner.
 */
export class DefaultPlanner extends AbstractPlanner {
  protected override generateGraphObject<EdgeType extends WeightedEdge>(): IWeightedGraph<GraphNode, EdgeType> {
    return new DirectedWeightedGraph<GraphNode, EdgeType>();
  }
}
