import { AbstractAction } from "@/AbstractAction";
import { Property } from "@/Property";
import { AnyObject, Queue } from "@/types";

export interface IUnit {
  /**
   * @returns current world state of the unit
   */
  getWorldState(): Set<Property>;
  /**
   * @returns goal state of the unit to reach
   */
  getGoalState(): Array<Property>;
  /**
   * @returns list of available actions for the unit
   */
  getActions(): Set<AbstractAction>;
  /**
   * General update from the Agent.
   * Called in a loop until the program ends.
   */
  update(): void;
  /**
   * Gets called when a plan was found by the planner.
   *
   * @param plan - the actions the unit hat to take in order to archive the goal
   */
  onGoapPlanFound(plan: Queue<AbstractAction>): void;
  /**
   * Gets called when a plan failed to execute.
   *
   * @param plan - the remaining actions in the action queue that failed
   */
  onGoapPlanFailed(plan: Queue<AbstractAction>): void;
  /**
   * Gets called when a plan was finished.
   */
  onGoapPlanFinished(): void;
  /**
   * Function to move to a specific location.
   * Gets called by the moveToState when the unit has to move to a certain target.
   *
   * @param target - the target the unit has to move to
   * @returns if the unit was able to move
   */
  onMoveToTarget(target: AnyObject): boolean;
}
