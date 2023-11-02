import { AbstractAction } from "@/AbstractAction";
import { Properties } from "@/alias";
import { IImportantUnitChangeEventListener } from "@/event/IImportantUnitChangeEventListener";
import { Property } from "@/Property";
import { AnyObject, PropertyId } from "@/types";
import { IUnit } from "@/unit/IUnit";
import { removeFromArray } from "@/utils/array";

/**
 * The superclass for a unit using the agent.
 */
export abstract class AbstractUnit implements IUnit {
  private goalState: Properties = [];
  private worldState: Properties = [];

  private actions: Array<AbstractAction> = [];
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
   * @param property - the new goal the unit tries to archive
   */
  public changeGoalImmediately(property: Property): void {
    this.addGoalState(property);
    this.dispatchNewImportantUnitGoalChangeEvent(property);
  }

  /**
   * @returns current world state of the unit
   */
  public getWorldState(): Properties {
    return this.worldState;
  }

  /**
   * Override current world state object.
   *
   * @param state - new state to override
   * @returns this
   */
  public setWorldState(state: Properties): typeof this {
    this.worldState = state;

    return this;
  }

  /**
   * Add new world state field.
   *
   * @param property
   * @returns this
   */
  public addWorldState(property: Property): typeof this {
    const index: number = this.worldState.findIndex((it) => it.id === property.id);

    if (index === -1) {
      this.worldState.push(property);
    } else {
      this.worldState[index] = property;
    }

    return this;
  }

  /**
   * @param id - identifier of the effect to remove
   * @returns this
   */
  public removeWorldStateProperty(id: PropertyId): typeof this {
    for (let it = 0; it < this.worldState.length; it++) {
      if (this.worldState[it].id === id) {
        this.worldState.splice(it, 1);

        return this;
      }
    }

    return this;
  }

  /**
   * @returns current goal properties list
   */
  public getGoalState(): Properties {
    return this.goalState;
  }

  /**
   * Set new goal state.
   *
   * @param goal - new properties list to set as goal
   * @returns this
   */
  public setGoalState(goal: Properties): typeof this {
    this.goalState = goal;

    return this;
  }

  /**
   * Add property to current goal state.
   *
   * @param property - new property to add
   * @returns this
   */
  public addGoalState(property: Property): typeof this {
    const index: number = this.goalState.findIndex((it) => it.id === property.id);

    if (index === -1) {
      this.goalState.push(property);
    } else {
      this.goalState[index] = property;
    }

    return this;
  }

  /**
   * Remove goal property from current goal state.
   *
   * @param id - identifier of the property to remove
   * @returns this
   */
  public removeGoalState(id: string): typeof this {
    for (let it = 0; it < this.goalState.length; it++) {
      if (this.goalState[it].id === id) {
        this.goalState.splice(it, 1);

        return this;
      }
    }

    return this;
  }

  /**
   * @returns list of currently available actions
   */
  public getActions(): Array<AbstractAction> {
    return this.actions;
  }

  /**
   * Set list of currently available actions.
   *
   * @param actions - list of available actions to set as current
   * @returns this
   */
  public setActions(actions: Array<AbstractAction>): typeof this {
    this.actions = actions;

    return this;
  }

  /**
   * @param action - new action to add in current available list
   * @returns this
   */
  public addAction(action: AbstractAction): typeof this {
    this.actions.push(action);

    return this;
  }

  /**
   * @param action - new action to remove from current available list
   */
  public removeAction(action: AbstractAction): boolean {
    return removeFromArray(this.actions, action);
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
   * @param newGoalProperty - new goal property to add
   */
  public dispatchNewImportantUnitGoalChangeEvent(newGoalProperty: Property): void {
    for (const listener of this.listeners) {
      listener.onImportantUnitGoalChange(newGoalProperty);
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
