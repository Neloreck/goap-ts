import { IEdge } from "@/graph/IEdge";

/**
 * Interface for displaying a path inside a graph containing lists of vertices and edges.
 * Represents vertices connected by edges, starting and ending point.
 * Does not contain any logics, just data container.
 */
export interface IPath<Vertex = unknown, Edge extends IEdge = IEdge> {
  readonly vertices: Array<Vertex>;
  readonly edges: Array<Edge>;
  readonly start: Vertex;
  readonly end: Vertex;
}
