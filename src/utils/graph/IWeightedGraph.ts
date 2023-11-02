import { IGraph } from "@/utils/graph/IGraph";
import { IWeightedEdge } from "@/utils/graph/IWeightedEdge";

/**
 * Interface implementing weighted edges graph.
 */
export interface IWeightedGraph<VertexType, EdgeType extends IWeightedEdge = IWeightedEdge>
  extends IGraph<VertexType, EdgeType> {}
