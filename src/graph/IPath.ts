import { IEdge } from "@/graph/IEdge";

/**
 * Interface  for displaying a path inside a graph containing lists of vertices and edges.
 * Represents vertices connected by edges, starting and ending point.
 * Does not contain any logics, just data container.
 */
export interface IPath<VertexType = unknown, EdgeType extends IEdge = IEdge> {
  readonly vertices: Array<VertexType>;
  readonly edges: Array<EdgeType>;
  readonly start: VertexType;
  readonly end: VertexType;
}
