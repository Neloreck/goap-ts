import { IFiniteStateMachinePlanEventListener } from "@/event/IFiniteStateMachinePlanEventListener";
import { Action } from "@/planner/Action";
import { IFiniteStateMachineState } from "@/state/IFiniteStateMachineState";
import { RunActionState } from "@/state/RunActionState";
import { AnyObject, Queue, Stack } from "@/types";
import { IUnit } from "@/unit/IUnit";
import { removeFromArray, stackPeek } from "@/utils";

export class FiniteStateMachine {
  private states: Stack<IFiniteStateMachineState> = [];
  private planEventListeners: Array<AnyObject> = [];

  /**
   * Run through all action in the specific states.
   * If an Exception occurs (mainly in RunActionState) the FSM assumes the plan failed.
   * If an action state returns false the FSM assumes the plan finished.
   *
   * @param unit - unit whose actions are getting cycled.
   */
  public update(unit: IUnit): void {
    try {
      if (this.states.length > 0 && !stackPeek(this.states).runAction(unit)) {
        const state: IFiniteStateMachineState = this.states.pop();

        if (state instanceof RunActionState) {
          this.dispatchNewPlanFinishedEvent();
        }
      }
    } catch (error) {
      const state: IFiniteStateMachineState = this.states.pop();

      if (state instanceof RunActionState) {
        this.dispatchNewPlanFailedEvent(state.getCurrentActions());
      }

      // todo: Print error.
    }
  }

  public pushStack(state: IFiniteStateMachineState): void {
    this.states.push(state);
  }

  public popStack(): IFiniteStateMachineState {
    return this.states.pop();
  }

  public clearStack(): void {
    this.states.length = 0;
  }

  public hasStates(): boolean {
    return this.states.length > 0;
  }

  public addPlanEventListener(listener: IFiniteStateMachinePlanEventListener): void {
    this.planEventListeners.push(listener);
  }

  public removePlanEventListener(listener: IFiniteStateMachinePlanEventListener): void {
    removeFromArray(this.planEventListeners, listener);
  }

  private dispatchNewPlanFailedEvent(actions: Queue<Action>): void {
    for (const listener of this.planEventListeners) {
      listener.onPlanFailed(actions);
    }
  }

  private dispatchNewPlanFinishedEvent(): void {
    for (const listener of this.planEventListeners) {
      listener.onPlanFinished();
    }
  }
}
