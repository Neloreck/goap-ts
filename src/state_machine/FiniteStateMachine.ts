import { AbstractAction } from "@/AbstractAction";
import { IFiniteStateMachinePlanEventListener } from "@/event/IFiniteStateMachinePlanEventListener";
import { IFiniteStateMachineState } from "@/state_machine/IFiniteStateMachineState";
import { RunActionState } from "@/state_machine/RunActionState";
import { Definable, Maybe, Queue, Stack } from "@/types";
import { IUnit } from "@/unit/IUnit";
import { removeFromArray, stackPeek } from "@/utils/array";

export class FiniteStateMachine {
  private states: Stack<IFiniteStateMachineState> = [];
  private planEventListeners: Array<IFiniteStateMachinePlanEventListener> = [];

  /**
   * @returns state machine states stack
   */
  public getStack(): Readonly<Stack<IFiniteStateMachineState>> {
    return this.states;
  }

  /**
   * Pushes value into stack.
   *
   * @param state - state to push
   */
  public push(state: IFiniteStateMachineState): void {
    this.states.push(state);
  }

  /**
   * @returns peek element and pops it from the stack
   */
  public pop(): Definable<IFiniteStateMachineState> {
    return this.states.pop();
  }

  /**
   * Clear states stack.
   */
  public clear(): void {
    this.states.length = 0;
  }

  /**
   * @returns if any states exist in the execution stack
   */
  public hasAny(): boolean {
    return this.states.length > 0;
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
  private dispatchNewPlanFailedEvent(plan: Queue<AbstractAction>): void {
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
   * If an Exception occurs (mainly in RunActionState) the FSM assumes the plan failed.
   * If an action state returns false the FSM assumes the plan finished.
   *
   * @param unit - unit whose actions are getting cycled
   */
  public update(unit: IUnit): void {
    try {
      // When stack action execution is finished, pop latest action and notify listeners if needed.
      if (this.states.length && !stackPeek(this.states).execute(unit) && this.states.pop() instanceof RunActionState) {
        this.dispatchNewPlanFinishedEvent();
      }
    } catch (error) {
      // Pop problematic action and notify listeners if needed.
      const state: Maybe<IFiniteStateMachineState> = this.states.pop();

      if (state instanceof RunActionState) {
        this.dispatchNewPlanFailedEvent(state.getCurrentPlan());
      }

      // todo: Print error.
    }
  }
}
