import { Action } from "@/planner/Action";
import { Optional, Queue } from "@/types";
import { IUnit } from "@/unit/IUnit";

export interface IPlanner {
  /**
   * @param unit - the unit for which an action queue is being created
   * @returns a created action queue or null, if no actions and goals match
   */
  plan(unit: IUnit): Optional<Queue<Action>>;
}
