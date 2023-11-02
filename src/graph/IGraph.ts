import { IEdge } from "@/graph/IEdge";
import { Optional } from "@/types";

/**
 * Basic graph interface describing public methods.
 */
export interface IGraph<VertexType, EdgeType extends IEdge = IEdge> {
  /**
   * @returns all vertices inside the graph
   */
  getVertices(): Set<VertexType>;
  /**
   * @returns all edges inside the graph
   */
  getEdges(): Set<EdgeType>;
  /**
   * @param firstVertex = the vertex from which the edge is coming from
   * @param secondVertex - the vertex the edge is going to
   * @returns the desired edge or null, if none is found
   */
  getEdge(firstVertex: VertexType, secondVertex: VertexType): Optional<EdgeType>;
  /**
   * @param firstVertex - the vertex from which the edge is coming from
   * @param secondVertex - the vertex the edge is going to
   * @returns if the edge exists
   */
  hasEdge(firstVertex: VertexType, secondVertex: VertexType): boolean;
  /**
   * @param vertex - the vertex being added
   */
  addVertex(vertex: VertexType): IGraph<VertexType, EdgeType>;
  /**
   * @param firstVertex - the vertex from which the edge is coming from
   * @param secondVertex - the vertex the edge is going to
   * @param edge - the edge itself that is going to be added
   */
  addEdge(firstVertex: VertexType, secondVertex: VertexType, edge: EdgeType): IGraph<VertexType, EdgeType>;
  /**
   * @param firstVertex -  the vertex from which the edge is coming from
   * @param secondVertex - the vertex the edge is going to
   */
  removeEdge(firstVertex: VertexType, secondVertex: VertexType): IGraph<VertexType, EdgeType>;
}
