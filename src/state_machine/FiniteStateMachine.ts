import { Plan } from "@/alias";
import { IErrorHandler, SilentErrorHandler } from "@/error";
import { IFiniteStateMachinePlanEventListener } from "@/event";
import { IFiniteStateMachineState } from "@/state_machine/IFiniteStateMachineState";
import { RunActionState } from "@/state_machine/RunActionState";
import { Maybe, Stack } from "@/types";
import { IUnit } from "@/unit/IUnit";
import { removeFromArray, stackPeek } from "@/utils/array";

export class FiniteStateMachine {
  public readonly stack: Stack<IFiniteStateMachineState> = [];
  private readonly planEventListeners: Array<IFiniteStateMachinePlanEventListener> = [];

  protected errorHandler: IErrorHandler;

  /**
   * @param errorHandler - class handling state machine errors
   */
  public constructor(errorHandler: IErrorHandler = new SilentErrorHandler()) {
    this.errorHandler = errorHandler;
  }

  /**
   * @returns list of listeners related to FSM events.
   */
  public getListeners(): Array<IFiniteStateMachinePlanEventListener> {
    return this.planEventListeners;
  }

  /**
   * Add plan events listener.
   *
   * @param listener - object to subscribe for listening
   */
  public addEventListener(listener: IFiniteStateMachinePlanEventListener): void {
    this.planEventListeners.push(listener);
  }

  /**
   * Remove plan events listener.
   *
   * @param listener - object to unsubscribe from listening
   */
  public removeEventListener(listener: IFiniteStateMachinePlanEventListener): void {
    removeFromArray(this.planEventListeners, listener);
  }

  /**
   * Dispatch event notifying all listeners about plan fail.
   *
   * @param plan - remaining actions after plan fail
   */
  private dispatchNewPlanFailedEvent(plan: Plan): void {
    for (const listener of this.planEventListeners) {
      listener.onPlanFailed(plan);
    }
  }

  /**
   * Dispatch event notifying all listeners about plan finish.
   */
  private dispatchNewPlanFinishedEvent(): void {
    for (const listener of this.planEventListeners) {
      listener.onPlanFinished();
    }
  }

  /**
   * Run through all action in the specific states.
   * If an error occurs (mainly in RunActionState) the FSM assumes the plan failed.
   * If an action state returns false the FSM assumes the plan finished.
   *
   * @param unit - unit whose actions are getting cycled
   */
  public update(unit: IUnit): void {
    try {
      // When stack action execution is finished, pop latest action and notify listeners if needed.
      if (
        this.stack.length &&
        (stackPeek(this.stack) as IFiniteStateMachineState).execute(unit) &&
        this.stack.pop() instanceof RunActionState
      ) {
        this.dispatchNewPlanFinishedEvent();
      }
    } catch (error) {
      // Pop problematic action and notify listeners if needed.
      const state: Maybe<IFiniteStateMachineState> = this.stack.pop();

      if (state instanceof RunActionState) {
        this.dispatchNewPlanFailedEvent(state.getCurrentPlan());
      }

      this.errorHandler.onError(error, "fsm_action_execution_error");
    }
  }
}
