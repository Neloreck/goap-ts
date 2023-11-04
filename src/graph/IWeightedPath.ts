import { IPath } from "@/graph/IPath";
import { IWeightedEdge } from "@/graph/IWeightedEdge";

/**
 * Interface for displaying a weighted path inside a graph containing lists of vertices and edges.
 */
export interface IWeightedPath<Vertex, Edge extends IWeightedEdge = IWeightedEdge> extends IPath<Vertex, Edge> {
  readonly totalWeight: number;
}
