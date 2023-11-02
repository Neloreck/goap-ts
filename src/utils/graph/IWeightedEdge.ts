import { IEdge } from "@/utils/graph/IEdge";

export interface IWeightedEdge extends IEdge {
  weight: number;
}
