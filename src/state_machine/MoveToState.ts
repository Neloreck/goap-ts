import { Action } from "@/Action";
import { IUnit } from "@/unit/IUnit";

import { IFiniteStateMachineState } from "./IFiniteStateMachineState";

export class MoveToState implements IFiniteStateMachineState {
  public currentAction: Action;

  /**
   * @param action -  the action which requires the unit to be in a certain range to its target
   */
  public constructor(action: Action) {
    this.currentAction = action;
  }

  /**
   * Move to the target of the currentAction until the unit is in range to perform the action itself.
   */
  public runAction(unit: IUnit): boolean {
    if (
      (this.currentAction.requiresInRange(unit) && this.currentAction.isInRange(unit)) ||
      this.currentAction.target === null
    ) {
      return false;
    } else {
      unit.moveTo(this.currentAction.target);
    }

    return true;
  }
}
