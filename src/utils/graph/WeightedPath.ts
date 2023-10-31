import { Path } from "@/utils/graph/Path";
import { WeightedEdge } from "@/utils/graph/WeightedEdge";

/**
 * A Class for displaying a weighted path inside a Graph containing Lists of vertices and edges.
 */
export class WeightedPath<VertexType, EdgeType extends WeightedEdge> extends Path<VertexType, EdgeType> {
  private totalWeight: number = 0;

  public constructor(
    vertexList: Array<VertexType>,
    edgeList: Array<EdgeType>,
    startVertex: VertexType,
    endVertex: VertexType
  ) {
    super(vertexList, edgeList, startVertex, endVertex);

    for (const edge of edgeList) {
      this.totalWeight += edge.getWeight();
    }
  }

  /**
   * @returns the sum of all edge-weights inside the weighted path
   */
  public getTotalWeight(): number {
    return this.totalWeight;
  }
}
