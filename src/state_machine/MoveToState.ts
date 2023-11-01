import { AbstractAction } from "@/AbstractAction";
import { IUnit } from "@/unit/IUnit";

import { IFiniteStateMachineState } from "./IFiniteStateMachineState";

/**
 * State on the FSM stack.
 * Used for execution of objects moving for proper execution of actions.
 */
export class MoveToState implements IFiniteStateMachineState {
  public action: AbstractAction;

  /**
   * @param action - the action which requires the unit to be in a certain range to its target
   */
  public constructor(action: AbstractAction) {
    this.action = action;
  }

  /**
   * Move to the target of the currentAction until the unit is in range to perform the action itself.
   *
   * @param unit - target unit to execute state for
   * @returns whether the action is finished
   */
  public execute(unit: IUnit): boolean {
    if (this.action.requiresInRange(unit) && !this.action.isInRange(unit) && this.action.target !== null) {
      unit.onMoveToTarget(this.action.target);

      return false;
    }

    return true;
  }
}
