import { IEdge } from "@/graph/IEdge";

export interface IWeightedEdge extends IEdge {
  weight: number;
}
