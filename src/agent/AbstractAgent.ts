import { IAgent } from "@/agent/IAgent";
import { Plan } from "@/alias";
import { IErrorHandler, SilentErrorHandler } from "@/error";
import { IPlanner } from "@/planner/IPlanner";
import { Property } from "@/property/Property";
import { FiniteStateMachine } from "@/state_machine/FiniteStateMachine";
import { IdleState } from "@/state_machine/IdleState";
import { RunActionState } from "@/state_machine/RunActionState";
import { AbstractUnit } from "@/unit/AbstractUnit";
import { IUnit } from "@/unit/IUnit";

/**
 * Agent object that wraps FSM, unit and planner logics.
 *
 * - Once agent is created, it facades all the linked abstractions
 * - For FSM it defines idle state that tries to re-plan actions when needed
 * - It runs updates for both unit and FSM
 */
export abstract class AbstractAgent implements IAgent {
  public readonly unit: IUnit;

  protected readonly fsm: FiniteStateMachine;
  protected readonly idle: IdleState;

  protected errorHandler: IErrorHandler;

  /**
   * @param unit - the unit the agent works with
   * @param errorHandler - object handling errors of planner
   */
  public constructor(unit: IUnit, errorHandler: IErrorHandler = new SilentErrorHandler()) {
    this.unit = unit;
    this.errorHandler = errorHandler;
    this.fsm = new FiniteStateMachine(errorHandler);
    this.idle = new IdleState(this.createPlanner());

    // Only subclasses of the own unit are able to emit events
    if (this.unit instanceof AbstractUnit) {
      this.unit.addListener(this);
    }

    this.idle.addListener(this);
    this.fsm.addEventListener(this);
  }

  /**
   * Function for subclasses to provide an instance of a planner which is going to be used to create the action queue.
   *
   * @returns the used planner instance implementing planner interface
   */
  protected abstract createPlanner(): IPlanner;

  /**
   * Handle update tick.
   * Manages idle state and unit updates.
   */
  public update(): void {
    if (!this.fsm.stack.length) {
      this.fsm.stack.push(this.idle);
    }

    this.unit.update();
    this.fsm.update(this.unit);
  }

  /**
   * Handle goal change and event that requires re-planning of the actions queue.
   *
   * @param property - new state that is marked as top-priority
   */
  public onImportantUnitGoalChange(property: Property): void {
    // todo: This mutation can be handled differently.
    property.importance = Infinity;
    this.fsm.stack.push(this.idle);
  }

  /**
   * Handle event of execution stack reset.
   * Resets all current actions and forces re-planning.
   */
  public onImportantUnitStackReset(): void {
    // Reset all actions of the unit before removing them.
    for (const action of this.unit.getActions()) {
      action.reset();
    }

    this.fsm.stack.length = 0;
    this.fsm.stack.push(this.idle);
  }

  /**
   * Handle new plan creation.
   * Start execution of the plan as soon as possible after plan creation.
   *
   * @param plan - newly created plan to work with
   */
  public onPlanCreated(plan: Plan): void {
    this.unit.onGoapPlanFound(plan);

    this.fsm.stack.pop();
    this.fsm.stack.push(new RunActionState(this.fsm, plan));
  }

  /**
   * Handle plan fail event.
   *
   * @param plan - remaining actions in the plan after failure
   */
  public onPlanFailed(plan: Plan): void {
    this.unit.onGoapPlanFailed(plan);
  }

  /**
   * Handle plan finished event.
   */
  public onPlanFinished(): void {
    this.unit.onGoapPlanFinished();
  }
}
