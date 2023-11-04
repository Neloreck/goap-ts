import { IGraph } from "@/graph/IGraph";
import { IWeightedEdge } from "@/graph/IWeightedEdge";

/**
 * Interface implementing weighted edges graph.
 */
export interface IWeightedGraph<Vertex, Edge extends IWeightedEdge = IWeightedEdge> extends IGraph<Vertex, Edge> {}
