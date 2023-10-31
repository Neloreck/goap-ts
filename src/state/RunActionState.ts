import { NotPerformableActionException } from "@/error/NotPerformableActionException";
import { Action } from "@/planner/Action";
import { FiniteStateMachine } from "@/state/FiniteStateMachine";
import { MoveToState } from "@/state/MoveToState";
import { Queue } from "@/types";
import { IUnit } from "@/unit/IUnit";
import { queuePeek } from "@/utils";

import { IFiniteStateMachineState } from "./IFiniteStateMachineState";

/**
 * State on the FSM Stack.
 */
export class RunActionState implements IFiniteStateMachineState {
  private readonly currentActions: Queue<Action>;
  private readonly fsm: FiniteStateMachine;

  /**
   * @param fsm - the FSM on which all states are being stacked.
   * @param currentActions - the Queue of actions to be taken in order to archive a goal.
   */
  public constructor(fsm: FiniteStateMachine, currentActions: Queue<Action>) {
    this.fsm = fsm;
    this.currentActions = currentActions;
  }

  /**
   * Cycle trough all actions until an invalid one or the end of the Queue is reached.
   * A false return type here causes the FSM to pop the state from its stack.
   */
  public runAction(unit: IUnit): boolean {
    let workingOnQueue: boolean = false;

    try {
      let missingAction: boolean = true;

      while (missingAction) {
        if (this.currentActions.length > 0 && queuePeek(this.currentActions).isDone(unit)) {
          this.currentActions.shift().reset();
        } else {
          missingAction = false;
        }
      }

      if (this.currentActions.length > 0) {
        const currentAction: Action = queuePeek(this.currentActions);

        // No Exception since handling this is user specific.
        if (currentAction.target === null) {
          // System.out.println("Target is null! " + currentAction.getClass().getSimpleName());
        }

        if (currentAction.requiresInRange(unit) && !currentAction.isInRange(unit)) {
          this.fsm.pushStack(new MoveToState(currentAction));
        } else if (currentAction.checkProceduralPrecondition(unit) && !currentAction.performAction(unit)) {
          throw new NotPerformableActionException(currentAction.constructor.name);
        }

        workingOnQueue = true;
      }
    } catch (error) {
      // todo: log the error
      // e.printStackTrace();
      // throw new Exception();
    }

    return workingOnQueue;
  }

  public getCurrentActions(): Queue<Action> {
    return this.currentActions;
  }
}
