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
 * Tries to re-plan events until new one is actually created.
 */
export class IdleState implements IFiniteStateMachineState {
  private planner: IPlanner;
  private planCreatedListeners: Array<IPlanCreatedEventListener> = [];

  public constructor(planner: IPlanner) {
    this.planner = planner;
  }

  /**
   * @param unit - target unit to execute state for
   */
  public execute(unit: IUnit): boolean {
    const plan: Queue<AbstractAction> = this.planner.plan(unit);

    if (plan) {
      this.dispatchPlanCreatedEvent(plan);
    }

    // Returning false would result in the RunActionState, which gets added to the Stack by the Agent, to be removed.
    return true;
  }

  /**
   * Add listener of plan creation event.
   *
   * @param listener - object listening for plan creation
   */
  public addListener(listener: IPlanCreatedEventListener): void {
    this.planCreatedListeners.push(listener);
  }

  /**
   * Remove listener of plan creation event.
   *
   * @param listener - object listening for plan creation
   */
  public removeListener(listener: IPlanCreatedEventListener): void {
    removeFromArray(this.planCreatedListeners, listener);
  }

  /**
   * Dispatch event notifying about plan creation.
   *
   * @param plan - queue of events to send with event notification
   */
  private dispatchPlanCreatedEvent(plan: Queue<AbstractAction>): void {
    for (const listener of this.planCreatedListeners) {
      listener.onPlanCreated(plan);
    }
  }
}
