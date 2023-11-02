import { IProperty } from "@/property/IProperty";
import { PropertyId } from "@/types";

/**
 * Properties which the GOAP planner use to build a graph.
 */
export class Property<Id extends PropertyId = PropertyId, Value = any> implements IProperty<Id, Value> {
  /**
   * @param id - the id the property has
   * @param value - the value of the property
   * @param importance - the importance of the state being reached. Only necessary if the state is used to define
   *   a worldState. Has no effect in actions being taken. Do NOT set this to Infinity since this causes the goal to be
   *   removed from the set by the planner
   */
  public constructor(
    public readonly id: Id,
    public readonly value: Value,
    public importance?: number
  ) {}
}
