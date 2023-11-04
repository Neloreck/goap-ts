import { AbstractAction } from "@/AbstractAction";
import { Plan } from "@/alias";
import { IErrorHandler, SilentErrorHandler } from "@/error";
import { NotPerformableActionError } from "@/error/NotPerformableActionError";
import { FiniteStateMachine } from "@/state_machine/FiniteStateMachine";
import { IFiniteStateMachineState } from "@/state_machine/IFiniteStateMachineState";
import { MoveToState } from "@/state_machine/MoveToState";
import { IUnit } from "@/unit/IUnit";

/**
 * State on the FSM Stack.
 */
export class RunActionState implements IFiniteStateMachineState {
  protected readonly plan: Plan;
  protected readonly fsm: FiniteStateMachine;

  protected errorHandler: IErrorHandler;

  /**
   * @param fsm - the FSM on which all states are being stacked
   * @param plan - the queue of actions to be taken in order to archive a goal
   * @param errorHandler - handler of run action execution errors
   */
  public constructor(fsm: FiniteStateMachine, plan: Plan, errorHandler: IErrorHandler = new SilentErrorHandler()) {
    this.fsm = fsm;
    this.plan = plan;
    this.errorHandler = errorHandler;
  }

  /**
   * @returns current plan that was applied when state was created
   */
  public getCurrentPlan(): Plan {
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
        if ((this.plan[0] as AbstractAction).isFinished(unit)) {
          (this.plan.shift() as AbstractAction).reset();
        } else {
          break;
        }
      }

      if (this.plan.length) {
        const currentAction: AbstractAction = this.plan[0] as AbstractAction;

        if (currentAction.target === null) {
          // todo: Propagate event with error handler?
          // System.out.println("Target is null! " + currentAction.getClass().getSimpleName());
        }

        // Should handle some movement conditions before continuation of execution.
        if (currentAction.requiresInRange(unit) && !currentAction.isInRange(unit)) {
          this.fsm.stack.push(new MoveToState(currentAction));
        } else if (currentAction.isAvailable(unit)) {
          if (currentAction.performAction(unit)) {
            return false;
          } else {
            throw new NotPerformableActionError(currentAction.constructor.name);
          }
        }

        // todo: Probably should consider action as done if it is not available anymore
        // todo: It will force FSM to go idle and rebuild the plan.

        return false;
      }
    } catch (error) {
      this.errorHandler.onError(error, "fsm_run_action_state_error");
    }

    return true;
  }
}
