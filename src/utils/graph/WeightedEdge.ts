import { Edge } from "@/utils/graph/Edge";

/**
 * A weighted edge for a Graph.
 */
export class WeightedEdge extends Edge {
  private weight: number;

  public constructor(weight: number = 0) {
    super();

    this.weight = weight;
  }

  public getWeight(): number {
    return this.weight;
  }

  public setWeight(weight: number): void {
    this.weight = weight;
  }
}
