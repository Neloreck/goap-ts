import { AbstractAction } from "@/AbstractAction";
import { IAgent } from "@/agent/IAgent";
import { IPlanner } from "@/planner/IPlanner";
import { State } from "@/State";
import { FiniteStateMachine } from "@/state_machine/FiniteStateMachine";
import { IdleState } from "@/state_machine/IdleState";
import { RunActionState } from "@/state_machine/RunActionState";
import { Queue } from "@/types";
import { IUnit } from "@/unit/IUnit";
import { Unit } from "@/unit/Unit";

export abstract class AbstractAgent implements IAgent {
  private readonly fsm: FiniteStateMachine = new FiniteStateMachine();
  private readonly idleState: IdleState;
  private readonly unit: IUnit;

  /**
   * @param unit - the unit the agent works with
   */
  public constructor(unit: IUnit) {
    this.unit = unit;
    this.idleState = new IdleState(this.generatePlannerObject());

    // Only subclasses of the own unit are able to emit events
    if (this.unit instanceof Unit) {
      this.unit.addImportantUnitGoalChangeListener(this);
    }

    this.idleState.addListener(this);
    this.fsm.addEventListener(this);
  }

  /**
   * Handle update tick.
   */
  public update(): void {
    if (!this.fsm.hasAny()) {
      this.fsm.push(this.idleState);
    }

    this.unit.update();
    this.fsm.update(this.unit);
  }

  public getUnit(): IUnit {
    return this.unit;
  }

  public onPlanCreated(plan: Queue<AbstractAction>): void {
    this.unit.goapPlanFound(plan);
    this.fsm.pop();
    this.fsm.push(new RunActionState(this.fsm, plan));
  }

  public onImportantUnitGoalChange(state: State): void {
    state.importance = Infinity;
    this.fsm.push(this.idleState);
  }

  public onImportantUnitStackResetChange(): void {
    // Reset all actions of the IUnit.
    for (const action of this.unit.getAvailableActions()) {
      action.reset();
    }

    this.fsm.clear();
    this.fsm.push(this.idleState);
  }

  /**
   * Handle plan fail event.
   */
  public onPlanFailed(plan: Queue<AbstractAction>): void {
    this.unit.goapPlanFailed(plan);
  }

  /**
   * Handle plan finished event.
   */
  public onPlanFinished(): void {
    this.unit.goapPlanFinished();
  }

  /**
   * Function for subclasses to provide an instance of a planner which is going to be used to create the action queue.
   *
   * @returns the used planner instance implementing planner interface
   */
  protected abstract generatePlannerObject(): IPlanner;
}
