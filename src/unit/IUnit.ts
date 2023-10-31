import { AbstractAction } from "@/AbstractAction";
import { State } from "@/State";
import { AnyObject, Queue } from "@/types";

export interface IUnit {
  getWorldState(): Set<State>;
  getGoalState(): Array<State>;
  getAvailableActions(): Set<AbstractAction>;
  /**
   * Gets called when a plan was found by the planner.
   *
   * @param actions - the actions the unit hat to take in order to archive the goal.
   */
  goapPlanFound(actions: Queue<AbstractAction>): void;
  /**
   * Gets called when a plan failed to execute.
   *
   * @param actions - the remaining actions in the action Queue that failed.
   */
  goapPlanFailed(actions: Queue<AbstractAction>): void;
  /**
   * Gets called when a plan was finished.
   */
  goapPlanFinished(): void;
  /**
   * General update from the Agent.
   * Called in a loop until the program ends.
   */
  update(): void;
  /**
   * Function to move to a specific location.
   * Gets called by the moveToState when the unit has to move to a certain target.
   *
   * @param target - the target the unit has to move to
   * @returns if the unit was able to move
   */
  moveTo(target: AnyObject): boolean;
}
