import { DirectedGraph } from "@/graph/DirectedGraph";
import { IWeightedEdge } from "@/graph/IWeightedEdge";
import { IWeightedGraph } from "@/graph/IWeightedGraph";

/**
 * A DirectedWeightedGraph using WeightedEdges as edges.
 */
export class DirectedWeightedGraph<Vertex, Edge extends IWeightedEdge = IWeightedEdge>
  extends DirectedGraph<Vertex, Edge>
  implements IWeightedGraph<Vertex, Edge> {}
