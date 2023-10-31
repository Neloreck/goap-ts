import { Action } from "@/planner/Action";
import { IUnit } from "@/unit/IUnit";

import { IFiniteStateMachineState } from "./IFiniteStateMachineState";

export class MoveToState implements IFiniteStateMachineState {
  public currentAction: Action;

  /**
   * @param currentAction -  the action which requires the unit to be in a certain range to its target.
   */
  public constructor(currentAction: Action) {
    this.currentAction = currentAction;
  }

  /**
   * Move to the target of the currentAction until the unit is in range to perform the action itself.
   */
  public runGoapAction(goapUnit: IUnit): boolean {
    let stillMoving: boolean = true;

    if (
      (this.currentAction.requiresInRange(goapUnit) && this.currentAction.isInRange(goapUnit)) ||
      this.currentAction.target === null
    ) {
      stillMoving = false;
    } else {
      goapUnit.moveTo(this.currentAction.target);
    }

    return stillMoving;
  }
}
