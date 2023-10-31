import { Action } from "@/planner/Action";
import { State } from "@/state/State";
import { AnyObject, Optional } from "@/types";
import { IImportantUnitChangeEventListener } from "@/unit/IImportantUnitChangeEventListener";
import { IUnit } from "@/unit/IUnit";
import { removeFromArray } from "@/utils";

/**
 * The superclass for a unit using the agent.
 */
export abstract class Unit implements IUnit {
  private goalState: Array<State> = [];
  private worldState: Set<State> = new Set();
  private availableActions: Set<Action> = new Set();

  private importantUnitGoalChangeListeners: Array<AnyObject> = [];

  /**
   * This function can be called by a subclass if the efforts of the unit
   * trying to archive a specific goal should be paused to fulfill a more
   * urgent goal. The GoapState is added to the main goal HashSet and changed
   * by the GoapAgent.
   * <p>
   * IMPORTANT:
   * <p>
   * The function must only be called once per two update cycles. The reason
   * for this is that the function pushes an IdleState on the FSM Stack which
   * is transformed into an GoapAction Queue in the current cycle. Calling the
   * function again in the next one pushes a new IdleState on top of this
   * generated action Queue, which renders the Queue obsolete and causes the
   * Unit to not perform any action since the RunActionState is now beneath
   * the newly pushed IdleState.
   *
   * @param state - the new goal the unit tries to archive.
   */
  protected changeGoalImmediately(state: State): void {
    this.goalState.push(state);
    this.dispatchNewImportantUnitGoalChangeEvent(state);
  }

  /**
   * Can be called to remove any existing GoapActions and start fresh.
   */
  protected resetActions(): void {
    this.dispatchNewImportantUnitStackResetEvent();
  }

  protected setWorldState(worldState: Set<State>): void {
    this.worldState = worldState;
  }

  protected addWorldState(newWorldState: State): void {
    let missing: boolean = true;

    for (const state of this.worldState) {
      if (newWorldState.effect === state.effect) {
        missing = false;

        break;
      }
    }

    if (missing) {
      this.worldState.add(newWorldState);
    }
  }

  protected removeWorldState(state: State): void;
  protected removeWorldState(effect: string): void;
  protected removeWorldState(effectOrState: string | State): void {
    // Handle state instance.
    if (effectOrState instanceof State) {
      this.worldState.delete(effectOrState);

      return;
    }

    // todo: Simplify.
    let marked: Optional<State> = null;

    for (const state of this.worldState) {
      if (effectOrState === state.effect) {
        marked = state;

        break;
      }
    }

    if (marked !== null) {
      this.worldState.delete(marked);
    }
  }

  public getWorldState(): Set<State> {
    return this.worldState;
  }

  protected setGoalState(list: Array<State>): void {
    this.goalState = list;
  }

  protected addGoalState(newGoalState: State): void {
    let missing: boolean = true;

    for (const state of this.goalState) {
      if (newGoalState.effect === state.effect) {
        missing = false;

        break;
      }
    }

    if (missing) {
      this.goalState.push(newGoalState);
    }
  }

  protected removeGoalState(effect: string): void {
    let marked: Optional<State> = null;

    for (const state of this.goalState) {
      if (effect === state.effect) {
        marked = state;

        break;
      }
    }

    if (marked) {
      removeFromArray(this.goalState, marked);
    }
  }

  protected removeGoalStat(goapState: State): void {
    removeFromArray(this.goalState, goapState);
  }

  public getGoalState(): Array<State> {
    return this.goalState;
  }

  protected setAvailableActions(availableActions: Set<Action>): void {
    this.availableActions = availableActions;
  }

  protected addAvailableAction(action: Action): void {
    if (!this.availableActions.has(action)) {
      this.availableActions.add(action);
    }
  }

  protected removeAvailableAction(action: Action): void {
    this.availableActions.delete(action);
  }

  public getAvailableActions(): Set<Action> {
    return this.availableActions;
  }

  public addImportantUnitGoalChangeListener(listener: AnyObject): void {
    this.importantUnitGoalChangeListeners.push(listener);
  }

  public removeImportantUnitGoalChangeListener(listener: AnyObject): void {
    removeFromArray(this.importantUnitGoalChangeListeners, listener);
  }

  private dispatchNewImportantUnitGoalChangeEvent(newGoalState: State): void {
    for (const listener of this.importantUnitGoalChangeListeners) {
      (listener as IImportantUnitChangeEventListener).onImportantUnitGoalChange(newGoalState);
    }
  }

  private dispatchNewImportantUnitStackResetEvent(): void {
    for (const listener of this.importantUnitGoalChangeListeners) {
      (listener as IImportantUnitChangeEventListener).onImportantUnitStackResetChange();
    }
  }

  public abstract goapPlanFailed(actions: Array<Action>): void;

  public abstract goapPlanFinished(): void;

  public abstract goapPlanFound(actions: Array<Action>): void;

  public abstract moveTo(target: AnyObject): boolean;

  public abstract update(): void;
}
