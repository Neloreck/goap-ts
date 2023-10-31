import { AbstractAction } from "@/AbstractAction";
import { IPlanCreatedEventListener } from "@/event/IPlanCreatedEventListener";
import { IPlanner } from "@/planner/IPlanner";
import { IFiniteStateMachineState } from "@/state_machine/IFiniteStateMachineState";
import { Queue } from "@/types";
import { IUnit } from "@/unit/IUnit";
import { removeFromArray } from "@/utils/array";

/**
 * State on the FSM stack.
 * Used for execution when plan is not available / empty.
 */
export class IdleState implements IFiniteStateMachineState {
  private planner: IPlanner;
  private planCreatedListeners: Array<IPlanCreatedEventListener> = [];

  public constructor(planner: IPlanner) {
    this.planner = planner;
  }

  public execute(unit: IUnit): boolean {
    const plan: Queue<AbstractAction> = this.planner.plan(unit);

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

  private dispatchPlanCreatedEvent(plan: Queue<AbstractAction>): void {
    for (const listener of this.planCreatedListeners) {
      listener.onPlanCreated(plan);
    }
  }
}
