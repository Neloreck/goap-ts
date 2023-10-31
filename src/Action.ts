import { State } from "@/State";
import { Optional } from "@/types";
import { IUnit } from "@/unit/IUnit";

/**
 * Superclass for all actions a unit can perform
 */
export abstract class Action<T = any> {
  public target: T;

  private preconditions: Set<State> = new Set();
  private effects: Set<State> = new Set();

  /**
   * @param target - the target of the action
   */
  public constructor(target: T) {
    this.target = target;
  }

  /**
   * Function used to reset an action. Gets called once the Action finishes or,
   * if the unit class was used, when the Stack on the FSM gets reset.
   */
  public abstract reset(): void;

  /**
   * Checks if the current action of the action queue is finished. Gets called until it returns true.
   *
   * @param unit - the unit the action is checked for
   * @returns success of the action, returning true causes the swap to the next action in the queue
   */
  public abstract isDone(unit: IUnit): boolean;

  /**
   * Gets called when the action is going to be executed by the Unit.
   *
   * @param unit - the unit that is trying to execute the action
   * @return if the action was successful
   */
  public abstract performAction(unit: IUnit): boolean;

  /**
   * This function will be called for each GoapAction in the generation of
   * each Graph to determine the cost for each node in the graph. The two
   * functions called in this function have to be implemented by the Subclass
   * to get the sum of both costs. Differentiating between the base cost and
   * the cost relative to the target gives a proper representation of the work
   * the unit has to do i.e. if it has to travel a large distance to reach its
   * target.
   *
   * @param unit - the unit whose action cost is being calculated
   * @return the calculated action cost
   */
  public generateCost(unit: IUnit): number {
    return this.generateBaseCost(unit) + this.generateCostRelativeToTarget(unit);
  }

  /**
   * Defines the base cost of the action.
   *
   * @param unit - the unit the action is being executed from
   * @returns the base cost of the action which is added to the cost relative  to the target
   */
  public abstract generateBaseCost(unit: IUnit): number;

  /**
   * Defines the relative cost of the action.
   *
   * @param unit - the unit the action is being executed from
   * @returns the relative cost of the action in relation to the current target, which is added to the base cost
   */
  public abstract generateCostRelativeToTarget(unit: IUnit): number;

  /**
   * Gets called to determine if the preconditions of an action are met.
   * If they are not, the action will not be taken in consideration for the generation of the action graph.
   *
   * @param unit - the unit the action is being executed from
   * @returns if the action can be taken in the first place
   */
  public abstract checkProceduralPrecondition(unit: IUnit): boolean;

  /**
   * Defines if the unit needs to be in a certain range in relation to the target to execute the action.
   *
   * @param unit - the unit the action is being executed from
   * @return if the action requires the unit to be in a certain range near the target
   */
  public abstract requiresInRange(unit: IUnit): boolean;

  /**
   * Function to determine if the unit is in a certain range. Only gets called
   * if the action requires to be in range relative to the target.
   *
   * @param unit - the unit the action is being executed from
   * @return if the unit is in range to execute the action
   */
  public abstract isInRange(unit: IUnit): boolean;

  public getPreconditions(): Set<State> {
    return this.preconditions;
  }

  public getEffects(): Set<State> {
    return this.effects;
  }

  public addPrecondition(precondition: State): void;
  public addPrecondition(importance: number, effect: string, value: T): void;

  /**
   * Overloaded function for convenience.
   *
   * @param importance - the importance of the precondition being added.
   * @param effect - the effect of the precondition being added.
   * @param value - the value of the precondition being added.
   */
  public addPrecondition(importance: number | State, effect?: string, value?: T): void {
    const precondition: State<T> = importance instanceof State ? importance : new State(importance, effect, value);

    let alreadyInList: boolean = false;

    // todo: Optimize...
    for (const state of this.preconditions) {
      if (state === precondition) {
        alreadyInList = true;
      }
    }

    if (!alreadyInList) {
      this.preconditions.add(precondition);
    }
  }

  /**
   * Remove a precondition from the set.
   *
   * @param effect - the effect which is going to be removed
   * @returns if the precondition was removed
   */
  protected removePrecondition(effect: string | State): boolean {
    const target: string = typeof effect === "string" ? effect : effect.effect;
    let stateToBeRemoved: State = null;

    // todo: Optimize...
    for (const state of this.effects) {
      if (state.effect === target) {
        stateToBeRemoved = state;
      }
    }

    if (stateToBeRemoved !== null) {
      this.preconditions.delete(stateToBeRemoved);

      return true;
    } else {
      return false;
    }
  }

  public addEffect(effect: State): void;
  public addEffect(importance: number, effect: string, value: T): void;

  /**
   * Overloaded function for convenience.
   *
   * @param importanceOrState - the importance of the effect being added
   * @param effect - the effect of the effect being added
   * @param value - the value of the effect being added
   */
  public addEffect(importanceOrState: number | State, effect?: string, value?: T): void {
    const target: State =
      importanceOrState instanceof State ? importanceOrState : new State(importanceOrState, effect, value);
    let alreadyInList: boolean = false;

    // Optimize...
    for (const state of this.effects) {
      if (state === target) {
        alreadyInList = true;
      }
    }

    if (!alreadyInList) {
      this.effects.add(target);
    }
  }

  /**
   * @param effectOrState - the effect or state effect which is going to be removed
   * @return if the effect was removed.
   */
  public removeEffect(effectOrState: string | State): boolean {
    const effectId: string = typeof effectOrState === "string" ? effectOrState : effectOrState.effect;
    let stateToBeRemoved: Optional<State> = null;

    for (const state of this.effects) {
      if (state.effect === effectId) {
        stateToBeRemoved = state;
      }
    }

    if (stateToBeRemoved !== null) {
      this.effects.delete(stateToBeRemoved);

      return true;
    } else {
      return false;
    }
  }
}
