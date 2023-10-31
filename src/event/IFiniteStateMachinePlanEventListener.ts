import { Action } from "@/planner/Action";
import { Queue } from "@/types";

export interface IFiniteStateMachinePlanEventListener {
  /**
   * Gets called when a RunActionState on the FSM throws an exception.
   *
   * @param plan - the rest of the action queue which failed to execute
   */
  onPlanFailed(plan: Queue<Action>): void;
  /**
   * Gets called when a RunActionState on the FSM returns true and therefore signals that it is finished.
   */
  onPlanFinished(): void;
}
