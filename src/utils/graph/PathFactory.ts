import { Optional } from "@/types";
import { Edge } from "@/utils/graph/Edge";
import { IGraph } from "@/utils/graph/IGraph";
import { Path } from "@/utils/graph/Path";
import { WeightedEdge } from "@/utils/graph/WeightedEdge";
import { WeightedPath } from "@/utils/graph/WeightedPath";

/**
 * Factory for generating Path objects. Checks the provided information against a provided Graph.
 */
export class PathFactory {
  /**
   * Function for generating a simple Path.
   * The given information are being checked against the given Graph.
   *
   * @param graph - the Graph the information are being checked against
   * @param start - the starting vertex of the Path
   * @param end - the end vertex of the Path
   * @param vertexList - the List of all vertices of the Path
   * @param edgeList - the List of all edges of the Path
   * @returns a Path leading from one point inside the Graph to another one
   */
  public static generatePath<VertexType, EdgeType extends Edge>(
    graph: IGraph<VertexType, EdgeType>,
    start: VertexType,
    end: VertexType,
    vertexList: Array<VertexType>,
    edgeList: Array<EdgeType>
  ): Optional<Path<VertexType, EdgeType>> {
    if (this.validateStartAndEnd(start, end, vertexList) && this.validateConnections(graph, vertexList, edgeList)) {
      return new Path(vertexList, edgeList, start, end);
    } else {
      return null;
    }
  }

  /**
   * Function for generating a WeightedPath. The given information are being
   * checked against the given Graph.
   *
   * @param graph - the Graph the information are being checked against
   * @param start - the starting vertex of the WeightedPath
   * @param end - the end vertex of the WeightedPath
   * @param vertexList - the List of all vertices of the WeightedPath
   * @param edgeList - the List of all edges of the WeightedPath
   * @returns a WeightedPath leading from one point inside the Graph to another one
   */
  public static generateWeightedPath<VertexType, EdgeType extends WeightedEdge>(
    graph: IGraph<VertexType, EdgeType>,
    start: VertexType,
    end: VertexType,
    vertexList: Array<VertexType>,
    edgeList: Array<EdgeType>
  ): Optional<WeightedPath<VertexType, EdgeType>> {
    if (this.validateStartAndEnd(start, end, vertexList) && this.validateConnections(graph, vertexList, edgeList)) {
      return new WeightedPath<VertexType, EdgeType>(vertexList, edgeList, start, end);
    } else {
      return null;
    }
  }

  /**
   * @param start - the provided start vertex
   * @param end - the provided end vertex
   * @param vertexList - the List of all vertices
   * @returns if the provided vertices are indeed the start and the end vertices
   */
  protected static validateStartAndEnd<VertexType>(
    start: VertexType,
    end: VertexType,
    vertexList: Array<VertexType>
  ): boolean {
    return (
      vertexList.includes(start) &&
      vertexList.includes(end) &&
      vertexList[0] === start &&
      vertexList[vertexList.length - 1] === end
    );
  }

  /**
   * Function for validating all vertices and edges of the given Lists.
   *
   * @param graph - the graph the information is being checked against.
   * @param vertexList - the List of all vertices of the Path being created.
   * @param edgeList - the List of all edges of the Path being created.
   * @returns if the provided Lists match the given Graph
   */
  protected static validateConnections<VertexType, EdgeType extends Edge>(
    graph: IGraph<VertexType, EdgeType>,
    vertexList: Array<VertexType>,
    edgeList: Array<EdgeType>
  ): boolean {
    let previousVertex: Optional<VertexType> = null;

    for (const vertex of vertexList) {
      if (previousVertex && !graph.containsEdge(previousVertex, vertex)) {
        return false;
      }

      previousVertex = vertex;
    }

    return true;
  }
}
