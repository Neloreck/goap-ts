import { Properties } from "@/alias";
import { Property } from "@/Property";
import { PropertyId } from "@/types";
import { IUnit } from "@/unit/IUnit";

/**
 * Superclass for all actions a unit can perform
 */
export abstract class AbstractAction<T = any> {
  public readonly preconditions: Properties = [];
  public readonly effects: Properties = [];

  public target: T;

  /**
   * @param target - the target of the action
   */
  public constructor(target: T) {
    this.target = target;
  }

  /**
   * @param property - new precondition property to add
   */
  public addPrecondition(property: Property): typeof this {
    if (this.preconditions.findIndex((it) => it.id === property.id) === -1) {
      this.preconditions.push(property);
    }

    return this;
  }

  /**
   * Remove a precondition from the set.
   *
   * @param id - the id of precondition which is going to be removed
   * @returns if the precondition was removed
   */
  public removePrecondition(id: PropertyId): typeof this {
    for (let it = 0; it < this.preconditions.length; it++) {
      if (this.preconditions[it].id === id) {
        this.preconditions.splice(it, 1);

        return this;
      }
    }

    return this;
  }

  /**
   * @param property - world precondition to remove from the action
   */
  public addEffect(property: Property): typeof this {
    if (this.effects.findIndex((it) => it.id === property.id) === -1) {
      this.effects.push(property);
    }

    return this;
  }

  /**
   * @param id - the id of effect which is going to be removed
   * @returns if the effect was removed
   */
  public removeEffect(id: PropertyId): typeof this {
    for (let it = 0; it < this.effects.length; it++) {
      if (this.effects[it].id === id) {
        this.effects.splice(it, 1);

        return this;
      }
    }

    return this;
  }

  /**
   * Gets called to determine if the preconditions of an action are met.
   * If they are not, the action will not be taken in consideration for the generation of the action graph.
   *
   * @param unit - the unit the action is being executed from
   * @returns if the action can be taken in the first place for planning of decisions
   */
  public abstract isAvailable(unit: IUnit): boolean;

  /**
   * Checks if the current action of the action queue is finished. Gets called until it returns true.
   *
   * @param unit - the unit the action is checked for
   * @returns success of the action, returning true causes the swap to the next action in the queue
   */
  public abstract isFinished(unit: IUnit): boolean;

  /**
   * Function used to reset an action. Gets called once the Action finishes or, if the unit class was used,
   * when the Stack on the FSM gets reset.
   */
  public abstract reset(): void;

  /**
   * Gets called when the action is going to be executed by the Unit.
   *
   * @param unit - the unit that is trying to execute the action
   * @returns if the action was successful
   */
  public abstract performAction(unit: IUnit): boolean;

  /**
   * This function will be called for each GoapAction in the generation of each Graph to determine the cost for each
   * node in the graph. The two functions called in this function have to be implemented by the Subclass to get the sum
   * of both costs. Differentiating between the base cost and the cost relative to the target gives a proper
   * representation of the work the unit has to do i.e. if it has to travel a large distance to reach its target.
   *
   * @param unit - the unit whose action cost is being calculated
   * @returns the calculated action cost
   */
  public generateCost(unit: IUnit): number {
    return this.generateBaseCost(unit) + this.generateCostRelativeToTarget(unit);
  }

  /**
   * Defines the base cost of the action.
   *
   * @param unit - the unit the action is being executed from
   * @returns the base cost of the action which is added to the cost relative to the target
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
}
