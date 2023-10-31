import { IGraph } from "@/utils/graph/IGraph";
import { WeightedEdge } from "@/utils/graph/WeightedEdge";

/**
 * Interface implementing weighted edges graph.
 */
export interface IWeightedGraph<VertexType, EdgeType> extends IGraph<VertexType, EdgeType> {
  /**
   * Function for retrieving the weight of a specific edge inside the
   * IWeightedGraphs implementer.
   *
   * @param edge - the edge whose weight is being searched for
   * @returns the weight of the given edge
   */
  getEdgeWeight(edge: WeightedEdge): number;
  /**
   * @param edge - the edge whose weight is being set
   * @param weight - the weight of the edge
   */
  setEdgeWeight(edge: WeightedEdge, weight: number): void;
}
