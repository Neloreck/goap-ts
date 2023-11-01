import { AbstractAction } from "@/AbstractAction";
import { NotPerformableActionException } from "@/error/NotPerformableActionException";
import { FiniteStateMachine } from "@/state_machine/FiniteStateMachine";
import { IFiniteStateMachineState } from "@/state_machine/IFiniteStateMachineState";
import { MoveToState } from "@/state_machine/MoveToState";
import { Queue } from "@/types";
import { IUnit } from "@/unit/IUnit";
import { queuePeek } from "@/utils/array";

/**
 * State on the FSM Stack.
 */
export class RunActionState implements IFiniteStateMachineState {
  private readonly plan: Queue<AbstractAction>;
  private readonly fsm: FiniteStateMachine;

  /**
   * @param fsm - the FSM on which all states are being stacked.
   * @param plan - the Queue of actions to be taken in order to archive a goal.
   */
  public constructor(fsm: FiniteStateMachine, plan: Queue<AbstractAction>) {
    this.fsm = fsm;
    this.plan = plan;
  }

  /**
   * @returns current plan that was applied when state was created
   */
  public getCurrentPlan(): Queue<AbstractAction> {
    return this.plan;
  }

  /**
   * Cycle through all actions until an invalid one or the end of the plan is reached.
   * A false return type here causes the FSM to pop the state from its stack.
   *
   * @returns whether the action is finished
   */
  public execute(unit: IUnit): boolean {
    try {
      // Find first action that is not done.
      // Shift all completed actions from the queue and reset them.
      while (this.plan.length) {
        if ((queuePeek(this.plan) as AbstractAction).isFinished(unit)) {
          (this.plan.shift() as AbstractAction).reset();
        } else {
          break;
        }
      }

      if (this.plan.length) {
        const currentAction: AbstractAction = queuePeek(this.plan) as AbstractAction;

        if (currentAction.target === null) {
          // todo: Propagate event with error handler.
          // System.out.println("Target is null! " + currentAction.getClass().getSimpleName());
        }

        // Should handle some movement conditions before continuation of execution.
        if (currentAction.requiresInRange(unit) && !currentAction.isInRange(unit)) {
          this.fsm.push(new MoveToState(currentAction));
        } else if (currentAction.checkProceduralPrecondition(unit)) {
          if (currentAction.performAction(unit)) {
            return false;
          } else {
            throw new NotPerformableActionException(currentAction.constructor.name);
          }
        }

        return false;
      }
    } catch (error) {
      // todo:  [error_handler] emit callbacks for handler.
      // e.printStackTrace();
      // throw new Exception();
    }

    return true;
  }
}
