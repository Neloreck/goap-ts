import { AbstractAction } from "@/AbstractAction";
import { IFiniteStateMachinePlanEventListener } from "@/event/IFiniteStateMachinePlanEventListener";
import { IFiniteStateMachineState } from "@/state_machine/IFiniteStateMachineState";
import { RunActionState } from "@/state_machine/RunActionState";
import { Maybe, Queue, Stack } from "@/types";
import { IUnit } from "@/unit/IUnit";
import { removeFromArray, stackPeek } from "@/utils/array";

export class FiniteStateMachine {
  private states: Stack<IFiniteStateMachineState> = [];
  private planEventListeners: Array<IFiniteStateMachinePlanEventListener> = [];

  /**
   * Run through all action in the specific states.
   * If an Exception occurs (mainly in RunActionState) the FSM assumes the plan failed.
   * If an action state returns false the FSM assumes the plan finished.
   *
   * @param unit - unit whose actions are getting cycled.
   */
  public update(unit: IUnit): void {
    try {
      if (this.states.length > 0 && !stackPeek(this.states).execute(unit)) {
        const state: IFiniteStateMachineState = this.states.pop();

        if (state instanceof RunActionState) {
          this.dispatchNewPlanFinishedEvent();
        }
      }
    } catch (error) {
      const state: Maybe<IFiniteStateMachineState> = this.states.pop();

      if (state instanceof RunActionState) {
        this.dispatchNewPlanFailedEvent(state.getCurrentActions());
      }

      // todo: Print error.
    }
  }

  /**
   * Pushes value into stack.
   *
   * @param state - state to push
   */
  public pushStack(state: IFiniteStateMachineState): void {
    this.states.push(state);
  }

  /**
   * @returns peek element and pops it from the stack
   */
  public popStack(): IFiniteStateMachineState {
    return this.states.pop();
  }

  /**
   * Clear states stack.
   */
  public clearStack(): void {
    this.states.length = 0;
  }

  /**
   * @returns if any states exist in the execution stack
   */
  public hasStates(): boolean {
    return this.states.length > 0;
  }

  /**
   * Add plan events listener.
   *
   * @param listener - object to subscribe for listening
   */
  public addPlanEventListener(listener: IFiniteStateMachinePlanEventListener): void {
    this.planEventListeners.push(listener);
  }

  /**
   * Remove plan events listener.
   *
   * @param listener - object to unsubscribe from listening
   */
  public removePlanEventListener(listener: IFiniteStateMachinePlanEventListener): void {
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
}
