import { Plan } from "@/alias";
import { IErrorHandler, SilentErrorHandler } from "@/error";
import { IFiniteStateMachinePlanEventListener } from "@/event";
import { IFiniteStateMachineState } from "@/state_machine/IFiniteStateMachineState";
import { RunActionState } from "@/state_machine/RunActionState";
import { Definable, Maybe, Stack } from "@/types";
import { IUnit } from "@/unit/IUnit";
import { removeFromArray, stackPeek } from "@/utils/array";

export class FiniteStateMachine {
  private readonly stack: Stack<IFiniteStateMachineState> = [];
  private readonly planEventListeners: Array<IFiniteStateMachinePlanEventListener> = [];

  protected errorHandler: IErrorHandler;

  /**
   * @param errorHandler - class handling state machine errors
   */
  public constructor(errorHandler: IErrorHandler = new SilentErrorHandler()) {
    this.errorHandler = errorHandler;
  }

  /**
   * @returns state machine states stack
   */
  public getStack(): Readonly<Stack<IFiniteStateMachineState>> {
    return this.stack;
  }

  /**
   * Pushes value into stack.
   *
   * @param state - state to push
   */
  public push(state: IFiniteStateMachineState): void {
    this.stack.push(state);
  }

  /**
   * @returns peek element and pops it from the stack
   */
  public pop(): Definable<IFiniteStateMachineState> {
    return this.stack.pop();
  }

  /**
   * Clear states stack.
   */
  public clear(): void {
    this.stack.length = 0;
  }

  /**
   * @returns if any states exist in the execution stack
   */
  public hasAny(): boolean {
    return this.stack.length > 0;
  }

  /**
   * @returns if no states exist in the execution stack
   */
  public isEmpty(): boolean {
    return this.stack.length === 0;
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
