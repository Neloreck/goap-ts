import { AbstractAction } from "@/AbstractAction";
import { IUnit } from "@/unit/IUnit";

import { IFiniteStateMachineState } from "./IFiniteStateMachineState";

export class MoveToState implements IFiniteStateMachineState {
  public currentAction: AbstractAction;

  /**
   * @param action -  the action which requires the unit to be in a certain range to its target
   */
  public constructor(action: AbstractAction) {
    this.currentAction = action;
  }

  /**
   * Move to the target of the currentAction until the unit is in range to perform the action itself.
   */
  public execute(unit: IUnit): boolean {
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
