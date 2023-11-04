import { IEdge } from "@/graph/IEdge";
import { IGraph } from "@/graph/IGraph";
import { Optional } from "@/types";

/**
 * Basic directed graph implementation.
 */
export class DirectedGraph<Vertex, Edge extends IEdge = IEdge> implements IGraph<Vertex, Edge> {
  protected data: Map<Vertex, Map<Vertex, Edge>> = new Map();

  public constructor(vertices?: Array<Vertex>) {
    // Link provided vertices in current graph.
    if (vertices) {
      for (const vertex of vertices) {
        this.data.set(vertex, new Map());
      }
    }
  }

  /**
   * @returns iterator over graph vertices
   */
  public vertices(): IterableIterator<Vertex> {
    return this.data.keys();
  }

  /**
   * @returns iterator over graph vertices
   */
  public edges(): IterableIterator<Edge> {
    const edges: Set<Edge> = new Set();

    for (const links of this.data.values()) {
      for (const edge of links.values()) {
        edges.add(edge);
      }
    }

    return edges.values();
  }

  /**
   * @param vertex - new vertex to add in graph
   * @returns this
   */
  public addVertex(vertex: Vertex): typeof this {
    this.data.set(vertex, new Map());

    return this;
  }

  /**
   * @param vertices - new vertices list to add in graph
   * @returns this
   */
  public addVertices(vertices: Array<Vertex>): typeof this {
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
  public addEdge(firstVertex: Vertex, secondVertex: Vertex, edge: Edge): typeof this {
    (this.data.get(firstVertex) as Map<Vertex, Edge>).set(secondVertex, edge);

    return this;
  }

  /**
   * @param firstVertex - vertex to remove link from
   * @param secondVertex - vertex to remove link to
   * @returns this
   */
  public removeEdge(firstVertex: Vertex, secondVertex: Vertex): typeof this {
    (this.data.get(firstVertex) as Map<Vertex, Edge>).delete(secondVertex);

    return this;
  }

  /**
   * @param firstVertex
   * @param secondVertex
   * @returns whether there is edge between two vertexes
   */
  public hasEdge(firstVertex: Vertex, secondVertex: Vertex): boolean {
    return this.data.get(firstVertex)?.has(secondVertex) === true;
  }

  /**
   * @returns set of vertices
   */
  public getVertices(): Array<Vertex> {
    return [...this.data.keys()];
  }

  /**
   * @returns set of edges in current graph
   */
  public getEdges(): Array<Edge> {
    const edges: Set<Edge> = new Set();

    for (const links of this.data.values()) {
      links.forEach((edge) => edges.add(edge));
    }

    return [...edges.values()];
  }

  /**
   * @param firstVertex - first vertex to check connection from
   * @param secondVertex - second vertex to check direction to
   * @returns edge linking first and second vertex or null
   */
  public getEdge(firstVertex: Vertex, secondVertex: Vertex): Optional<Edge> {
    return this.data.get(firstVertex)?.get(secondVertex) ?? null;
  }
}
