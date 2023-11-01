import { AbstractAction } from "@/AbstractAction";
import { IImportantUnitChangeEventListener } from "@/event/IImportantUnitChangeEventListener";
import { State } from "@/State";
import { AnyObject, Optional } from "@/types";
import { IUnit } from "@/unit/IUnit";
import { removeFromArray } from "@/utils/array";

/**
 * The superclass for a unit using the agent.
 */
export abstract class AbstractUnit implements IUnit {
  private goal: Array<State> = [];
  private state: Set<State> = new Set();
  private actions: Set<AbstractAction> = new Set();
  private listeners: Array<IImportantUnitChangeEventListener> = [];

  /**
   * This function can be called by a subclass if the efforts of the unit trying to archive a specific goal should be
   * paused to fulfill a more urgent goal. The GoapState is added to the main goal set and changed by the agent.
   *
   * IMPORTANT:
   * The function must only be called once per two update cycles. The reason for this is that the function pushes
   * an IdleState on the FSM Stack which is transformed into an GoapAction Queue in the current cycle.
   * Calling the function again in the next one pushes a new IdleState on top of this generated action Queue,
   * which renders the Queue obsolete and causes the Unit to not perform any action since the RunActionState is now
   * beneath the newly pushed IdleState.
   *
   * @param state - the new goal the unit tries to archive
   */
  public changeGoalImmediately(state: State): void {
    this.goal.push(state);
    this.dispatchNewImportantUnitGoalChangeEvent(state);
  }

  /**
   * @returns current world state of the unit
   */
  public getWorldState(): Set<State> {
    return this.state;
  }

  /**
   * Override current world state object.
   *
   * @param state - new state to override
   */
  public setWorldState(state: Set<State>): void {
    this.state = state;
  }

  /**
   * Add new world state field.
   *
   * @param state
   */
  public addWorldState(state: State): void {
    let missing: boolean = true;

    for (const existing of this.state) {
      if (state.effect === existing.effect) {
        missing = false;

        break;
      }
    }

    if (missing) {
      this.state.add(state);
    }
  }

  /**
   * @param effect - identifier of the effect to remove
   */
  public removeWorldStateProperty(effect: string): void {
    // todo: Simplify.
    let marked: Optional<State> = null;

    for (const state of this.state) {
      if (effect === state.effect) {
        marked = state;

        break;
      }
    }

    if (marked !== null) {
      this.state.delete(marked);
    }
  }

  /**
   * @returns current goal properties list
   */
  public getGoalState(): Array<State> {
    return this.goal;
  }

  /**
   * Set new goal state.
   *
   * @param goal - new properties list to set as goal
   */
  public setGoalState(goal: Array<State>): void {
    this.goal = goal;
  }

  /**
   * Add property to current goal state.
   *
   * @param newGoalState - new property to add
   */
  public addGoalState(newGoalState: State): void {
    let missing: boolean = true;

    for (const state of this.goal) {
      if (newGoalState.effect === state.effect) {
        missing = false;

        break;
      }
    }

    if (missing) {
      this.goal.push(newGoalState);
    }
  }

  /**
   * Remove goal property from current goal state.
   *
   * @param effect - identifier of the property to remove
   */
  public removeGoalState(effect: string): void {
    let marked: Optional<State> = null;

    for (const state of this.goal) {
      if (effect === state.effect) {
        marked = state;

        break;
      }
    }

    if (marked) {
      removeFromArray(this.goal, marked);
    }
  }

  /**
   * @returns list of currently available actions
   */
  public getActions(): Set<AbstractAction> {
    return this.actions;
  }

  /**
   * Set list of currently available actions.
   *
   * @param actions - list of available actions to set as current
   */
  public setActions(actions: Set<AbstractAction>): void {
    this.actions = actions;
  }

  /**
   * @param action - new action to add in current available list
   */
  public addAction(action: AbstractAction): void {
    this.actions.add(action);
  }

  /**
   * @param action - new action to remove from current available list
   */
  public removeAction(action: AbstractAction): void {
    this.actions.delete(action);
  }

  /**
   * Can be called to reset any existing actions and start fresh plan.
   */
  public resetActions(): void {
    this.dispatchNewImportantUnitStackResetEvent();
  }

  /**
   * @returns list of unit events listeners
   */
  public getListeners(): Array<IImportantUnitChangeEventListener> {
    return this.listeners;
  }

  /**
   * @param listener - new listener to handle unit events
   */
  public addListener(listener: IImportantUnitChangeEventListener): void {
    this.listeners.push(listener);
  }

  /**
   * @param listener - event listener to unsubscribe
   */
  public removeListener(listener: IImportantUnitChangeEventListener): void {
    removeFromArray(this.listeners, listener);
  }

  /**
   * Dispatch event of current goal state change.
   *
   * @param newGoalState - new goal property to add
   */
  public dispatchNewImportantUnitGoalChangeEvent(newGoalState: State): void {
    for (const listener of this.listeners) {
      listener.onImportantUnitGoalChange(newGoalState);
    }
  }

  /**
   * Dispatch event of action stack state reset.
   */
  public dispatchNewImportantUnitStackResetEvent(): void {
    for (const listener of this.listeners) {
      listener.onImportantUnitStackReset();
    }
  }

  /**
   * Handle generic update tick.
   */
  public abstract update(): void;

  public abstract onGoapPlanFailed(actions: Array<AbstractAction>): void;

  public abstract onGoapPlanFinished(): void;

  public abstract onGoapPlanFound(actions: Array<AbstractAction>): void;

  public abstract onMoveToTarget(target: AnyObject): boolean;
}
