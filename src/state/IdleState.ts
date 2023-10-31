import { IPlanCreatedEventListener } from "@/event/IPlanCreatedEventListener";
import { Action } from "@/planner/Action";
import { IPlanner } from "@/planner/IPlanner";
import { IFiniteStateMachineState } from "@/state/IFiniteStateMachineState";
import { Queue } from "@/types";
import { IUnit } from "@/unit/IUnit";
import { removeFromArray } from "@/utils/array";

/**
 * State on the FSM stack.
 */
export class IdleState implements IFiniteStateMachineState {
  private planner: IPlanner;
  private planCreatedListeners: Array<IPlanCreatedEventListener> = [];

  public constructor(planner: IPlanner) {
    this.planner = planner;
  }

  public runAction(unit: IUnit): boolean {
    const plan: Queue<Action> = this.planner.plan(unit);

    if (plan) {
      this.dispatchPlanCreatedEvent(plan);
    }

    // Returning false would result in the RunActionState, which gets added to the Stack by the Agent, to be removed.
    return true;
  }

  public addListener(listener: IPlanCreatedEventListener): void {
    this.planCreatedListeners.push(listener);
  }

  public removeListener(listener: IPlanCreatedEventListener): void {
    removeFromArray(this.planCreatedListeners, listener);
  }

  private dispatchPlanCreatedEvent(plan: Queue<Action>): void {
    for (const listener of this.planCreatedListeners) {
      listener.onPlanCreated(plan);
    }
  }
}
