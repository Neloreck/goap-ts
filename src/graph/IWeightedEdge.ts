import { IEdge } from "@/graph/IEdge";

/**
 * Generic graph edge interface containing edge weight.
 */
export interface IWeightedEdge extends IEdge {
  weight: number;
}
