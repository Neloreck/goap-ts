import { PropertyId } from "@/types";

/**
 * Properties which the GOAP planner use to build a graph.
 */
export class Property<IdType = PropertyId, ValueType = any> {
  public readonly id: IdType;
  public readonly value: ValueType;

  public importance: number = 0;

  /**
   * @param effect - the effect the state has
   * @param value - the value of the effect
   * @param importance - the importance of the state being reached. Only necessary if the state is used to define
   *   a worldState. Has no effect in Actions being taken. Do NOT set this to Infinity since this causes the goal to be
   *   removed from the set by the planner
   */
  public constructor(effect: IdType, value: ValueType, importance?: number) {
    this.id = effect;
    this.value = value;
    this.importance = !importance || importance < 0 ? 0 : importance;
  }
}
