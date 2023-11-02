import { IPath } from "@/utils/graph/IPath";
import { WeightedEdge } from "@/utils/graph/WeightedEdge";

/**
 * Interface  for displaying a weighted path inside a graph containing lists of vertices and edges.
 */
export interface IWeightedPath<VertexType, EdgeType extends WeightedEdge = WeightedEdge>
  extends IPath<VertexType, EdgeType> {
  readonly totalWeight: number;
}
