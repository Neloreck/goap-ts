import { PropertyId } from "@/types";

/**
 * Properties which the GOAP planner use to build a graph.
 */
export class Property<IdType = PropertyId, ValueType = any> {
  public readonly id: IdType;
  public readonly value: ValueType;

  public importance: number = 0;

  /**
   * @param id - the id the property has
   * @param value - the value of the property
   * @param importance - the importance of the state being reached. Only necessary if the state is used to define
   *   a worldState. Has no effect in actions being taken. Do NOT set this to Infinity since this causes the goal to be
   *   removed from the set by the planner
   */
  public constructor(id: IdType, value: ValueType, importance?: number) {
    this.id = id;
    this.value = value;
    this.importance = !importance || importance < 0 ? 0 : importance;
  }
}
