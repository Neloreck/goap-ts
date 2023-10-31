import { DirectedGraph } from "@/utils/graph/DirectedGraph";
import { IWeightedGraph } from "@/utils/graph/IWeightedGraph";
import { WeightedEdge } from "@/utils/graph/WeightedEdge";

/**
 * A DirectedWeightedGraph using WeightedEdges as edges.
 */
export class DirectedWeightedGraph<VertexType, EdgeType extends WeightedEdge>
  extends DirectedGraph<VertexType, EdgeType>
  implements IWeightedGraph<VertexType, EdgeType>
{
  public getEdgeWeight(edge: WeightedEdge): number {
    return edge.getWeight();
  }

  public setEdgeWeight(edge: WeightedEdge, weight: number): void {
    edge.setWeight(weight);
  }
}
