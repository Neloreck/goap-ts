import { DirectedGraph } from "@/graph/DirectedGraph";
import { IWeightedEdge } from "@/graph/IWeightedEdge";
import { IWeightedGraph } from "@/graph/IWeightedGraph";

/**
 * A DirectedWeightedGraph using WeightedEdges as edges.
 */
export class DirectedWeightedGraph<VertexType, EdgeType extends IWeightedEdge = IWeightedEdge>
  extends DirectedGraph<VertexType, EdgeType>
  implements IWeightedGraph<VertexType, EdgeType> {}
