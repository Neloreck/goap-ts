import { Edge } from "@/utils/graph/Edge";

/**
 * A Class for displaying a path inside a Graph containing Lists of vertices and edges.
 */
export class Path<VertexType, EdgeType extends Edge> {
  private readonly vertexList: Array<VertexType>;
  private readonly edgeList: Array<EdgeType>;
  private readonly startVertex: VertexType;
  private readonly endVertex: VertexType;

  public constructor(
    vertexList: Array<VertexType>,
    edgeList: Array<EdgeType>,
    startVertex: VertexType,
    endVertex: VertexType
  ) {
    this.vertexList = vertexList;
    this.edgeList = edgeList;
    this.startVertex = startVertex;
    this.endVertex = endVertex;
  }

  /**
   * @returns a list containing all vertices of the path
   */
  public getVertexList(): Array<VertexType> {
    return this.vertexList;
  }

  /**
   * @returns a list containing all edges of the path
   */
  public getEdgeList(): Array<EdgeType> {
    return this.edgeList;
  }

  public getStartVertex(): VertexType {
    return this.startVertex;
  }

  public getEndVertex(): VertexType {
    return this.endVertex;
  }
}
