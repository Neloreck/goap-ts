import { IEdge } from "@/graph/IEdge";
import { IGraph } from "@/graph/IGraph";
import { Optional } from "@/types";

/**
 * Basic directed graph implementation.
 */
export class DirectedGraph<VertexType, EdgeType extends IEdge = IEdge> implements IGraph<VertexType, EdgeType> {
  protected data: Map<VertexType, Map<VertexType, EdgeType>> = new Map();

  public constructor(vertices?: Array<VertexType>) {
    // Link provided vertices in current graph.
    if (vertices) {
      for (const vertex of vertices) {
        this.data.set(vertex, new Map());
      }
    }
  }

  /**
   * @param vertex - new vertex to add in graph
   * @returns this
   */
  public addVertex(vertex: VertexType): typeof this {
    this.data.set(vertex, new Map());

    return this;
  }

  /**
   * @param vertices - new vertices list to add in graph
   * @returns this
   */
  public addVertices(vertices: Array<VertexType>): typeof this {
    for (const vertex of vertices) {
      this.data.set(vertex, new Map());
    }

    return this;
  }

  /**
   * @param firstVertex - vertex to set connection from
   * @param secondVertex - vertex to set connection to
   * @param edge - edge connecting two vertexes
   * @returns this
   */
  public addEdge(firstVertex: VertexType, secondVertex: VertexType, edge: EdgeType): typeof this {
    (this.data.get(firstVertex) as Map<VertexType, EdgeType>).set(secondVertex, edge);

    return this;
  }

  /**
   * @param firstVertex - vertex to remove link from
   * @param secondVertex - vertex to remove link to
   * @returns this
   */
  public removeEdge(firstVertex: VertexType, secondVertex: VertexType): typeof this {
    (this.data.get(firstVertex) as Map<VertexType, EdgeType>).delete(secondVertex);

    return this;
  }

  /**
   * @param firstVertex
   * @param secondVertex
   * @returns whether there is edge between two vertexes
   */
  public hasEdge(firstVertex: VertexType, secondVertex: VertexType): boolean {
    return this.data.get(firstVertex)?.has(secondVertex) === true;
  }

  /**
   * @returns set of vertices
   */
  public getVertices(): Set<VertexType> {
    return new Set(this.data.keys());
  }

  /**
   * @returns set of edges in current graph
   */
  public getEdges(): Set<EdgeType> {
    const edges: Set<EdgeType> = new Set();

    for (const links of this.data.values()) {
      links.forEach((edge) => edges.add(edge));
    }

    return edges;
  }

  /**
   * @param firstVertex - first vertex to check connection from
   * @param secondVertex - second vertex to check direction to
   * @returns edge linking first and second vertex or null
   */
  public getEdge(firstVertex: VertexType, secondVertex: VertexType): Optional<EdgeType> {
    return this.data.get(firstVertex)?.get(secondVertex) ?? null;
  }
}
