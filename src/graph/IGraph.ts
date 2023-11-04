import { IEdge } from "@/graph/IEdge";
import { Optional } from "@/types";

/**
 * Basic graph interface describing public methods.
 */
export interface IGraph<Vertex, Edge extends IEdge = IEdge> {
  /**
   * @returns vertices iterator
   */
  vertices(): IterableIterator<Vertex>;
  /**
   * @returns edges iterator
   */
  edges(): IterableIterator<Edge>;
  /**
   * @returns all vertices inside the graph
   */
  getVertices(): Array<Vertex>;
  /**
   * @returns all edges inside the graph
   */
  getEdges(): Array<Edge>;
  /**
   * @param firstVertex = the vertex from which the edge is coming from
   * @param secondVertex - the vertex the edge is going to
   * @returns the desired edge or null, if none is found
   */
  getEdge(firstVertex: Vertex, secondVertex: Vertex): Optional<Edge>;
  /**
   * @param firstVertex - the vertex from which the edge is coming from
   * @param secondVertex - the vertex the edge is going to
   * @returns if the edge exists
   */
  hasEdge(firstVertex: Vertex, secondVertex: Vertex): boolean;
  /**
   * @param vertex - the vertex being added
   */
  addVertex(vertex: Vertex): IGraph<Vertex, Edge>;
  /**
   * @param firstVertex - the vertex from which the edge is coming from
   * @param secondVertex - the vertex the edge is going to
   * @param edge - the edge itself that is going to be added
   */
  addEdge(firstVertex: Vertex, secondVertex: Vertex, edge: Edge): IGraph<Vertex, Edge>;
  /**
   * @param firstVertex -  the vertex from which the edge is coming from
   * @param secondVertex - the vertex the edge is going to
   */
  removeEdge(firstVertex: Vertex, secondVertex: Vertex): IGraph<Vertex, Edge>;
}
