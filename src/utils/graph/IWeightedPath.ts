import { IPath } from "@/utils/graph/IPath";
import { IWeightedEdge } from "@/utils/graph/IWeightedEdge";

/**
 * Interface  for displaying a weighted path inside a graph containing lists of vertices and edges.
 */
export interface IWeightedPath<VertexType, EdgeType extends IWeightedEdge = IWeightedEdge>
  extends IPath<VertexType, EdgeType> {
  readonly totalWeight: number;
}
