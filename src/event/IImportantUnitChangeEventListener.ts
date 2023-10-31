import { State } from "@/State";

export interface IImportantUnitChangeEventListener {
  /**
   * This event is needed to change a current goal to a new one, while keeping the old one on the FSM-Stack for its
   * later execution. The importance is set to the highest possible value to ensure that the given goal is the main one
   * of the unit. This causes the Idle Stack to create a queue specifically for this state, which is empty
   * if no valid Queue is found (null not possible since that would result in the IdleState to try until one is found).
   * The empty queue causes the unit to proceed with its previous action.
   *
   * @param newGoalState - the new goal that the unit is going to accomplish
   */
  onImportantUnitGoalChange(newGoalState: State): void;
  /**
   * Event emitted by the unit if the actions on the FSM-Stack must reset.
   */
  onImportantUnitStackResetChange(): void;
}
