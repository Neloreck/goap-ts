import { DirectedGraph } from "@/utils/graph/DirectedGraph";
import { IWeightedEdge } from "@/utils/graph/IWeightedEdge";
import { IWeightedGraph } from "@/utils/graph/IWeightedGraph";

/**
 * A DirectedWeightedGraph using WeightedEdges as edges.
 */
export class DirectedWeightedGraph<VertexType, EdgeType extends IWeightedEdge = IWeightedEdge>
  extends DirectedGraph<VertexType, EdgeType>
  implements IWeightedGraph<VertexType, EdgeType> {}
