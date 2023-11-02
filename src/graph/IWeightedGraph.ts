import { IGraph } from "@/graph/IGraph";
import { IWeightedEdge } from "@/graph/IWeightedEdge";

/**
 * Interface implementing weighted edges graph.
 */
export interface IWeightedGraph<VertexType, EdgeType extends IWeightedEdge = IWeightedEdge>
  extends IGraph<VertexType, EdgeType> {}
