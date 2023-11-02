import { PropertyId } from "@/types";

export interface IProperty<Id extends PropertyId = PropertyId, Value = any> {
  readonly id: Id;
  readonly value: Value;

  // Used for goal properties to define which one is more important.
  importance?: number;
}
