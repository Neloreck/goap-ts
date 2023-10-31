import { Action } from "@/planner/Action";
import { Queue } from "@/types";

export interface IFiniteStateMachinePlanEventListener {
  /**
   * Gets called when a RunActionState on the FSM throws an exception.
   *
   * @param actions - the rest of the action Queue which failed to execute
   */
  onPlanFailed(actions: Queue<Action>): void;
  /**
   * Gets called when a RunActionState on the FSM returns true and therefore signals that it is finished.
   */
  onPlanFinished(): void;
}
