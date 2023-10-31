import { Action } from "@/planner/Action";
import { IPlanner } from "@/planner/IPlanner";
import { IFiniteStateMachineState } from "@/state/IFiniteStateMachineState";
import { IPlanCreatedEventListener } from "@/state/IPlanCreatedEventListener";
import { AnyObject, Queue } from "@/types";
import { IUnit } from "@/unit/IUnit";
import { removeFromArray } from "@/utils/array";

/**
 * State on the FSM stack.
 */
export class IdleState implements IFiniteStateMachineState {
  private goapPlanner: IPlanner;
  private planCreatedListeners: Array<AnyObject> = [];

  public constructor(goapPlanner: IPlanner) {
    this.goapPlanner = goapPlanner;
  }

  public runGoapAction(goapUnit: IUnit): boolean {
    const plannedQueue: Queue<Action> = this.goapPlanner.plan(goapUnit);

    if (plannedQueue !== null) {
      this.dispatchNewPlanCreatedEvent(plannedQueue);
    }

    // Returning false would result in the RunActionState, which gets added
    // to the Stack by the Agent, to be removed.
    return true;
  }

  public addPlanCreatedListener(listener: AnyObject): void {
    this.planCreatedListeners.push(listener);
  }

  public removePlanCreatedListener(listener: AnyObject): void {
    removeFromArray(this.planCreatedListeners, listener);
  }

  private dispatchNewPlanCreatedEvent(plan: Queue<Action>): void {
    for (const listener of this.planCreatedListeners) {
      (listener as IPlanCreatedEventListener).onPlanCreated(plan);
    }
  }
}
