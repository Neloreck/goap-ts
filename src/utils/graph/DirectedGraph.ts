import { Optional } from "@/types";
import { Edge } from "@/utils/graph/Edge";
import { IGraph } from "@/utils/graph/IGraph";

/**
 * Basic directed graph implementation.
 */
export class DirectedGraph<VertexType, EdgeType extends Edge> implements IGraph<VertexType, EdgeType> {
  protected content: Map<VertexType, Map<VertexType, EdgeType>> = new Map();

  public constructor(vertices?: Set<VertexType>) {
    // Link provided vertices in current graph.
    if (vertices) {
      for (const vertex of vertices) {
        this.content.set(vertex, new Map());
      }
    }
  }

  /**
   * @param vertex - new vertex to add in graph
   * @returns this
   */
  public addVertex(vertex: VertexType): typeof this {
    this.content.set(vertex, new Map());

    return this;
  }

  /**
   * @param firstVertex - vertex to set connection from
   * @param secondVertex - vertex to set connection to
   * @param edge - edge connecting two vertexes
   * @returns this
   */
  public addEdge(firstVertex: VertexType, secondVertex: VertexType, edge: EdgeType): typeof this {
    this.content.get(firstVertex).set(secondVertex, edge);

    return this;
  }

  /**
   * @param firstVertex - vertex to remove link from
   * @param secondVertex - vertex to remove link to
   * @returns this
   */
  public removeEdge(firstVertex: VertexType, secondVertex: VertexType): typeof this {
    this.content.get(firstVertex).delete(secondVertex);

    return this;
  }

  /**
   * @param firstVertex
   * @param secondVertex
   * @returns whether there is edge between two vertexes
   */
  public containsEdge(firstVertex: VertexType, secondVertex: VertexType): boolean {
    return this.content.get(firstVertex).has(secondVertex);
  }

  /**
   * @returns set of vertices
   */
  public getVertices(): Set<VertexType> {
    return new Set(this.content.keys());
  }

  /**
   * @returns set of edges in current graph
   */
  public getEdges(): Set<EdgeType> {
    const edges: Set<EdgeType> = new Set();

    for (const links of this.content.values()) {
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
    return this.content.get(firstVertex).get(secondVertex) ?? null;
  }
}
