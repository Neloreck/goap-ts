import { IAgent } from "@/agent/IAgent";
import { Action } from "@/planner/Action";
import { IPlanner } from "@/planner/IPlanner";
import { FiniteStateMachine } from "@/state/FiniteStateMachine";
import { IdleState } from "@/state/IdleState";
import { RunActionState } from "@/state/RunActionState";
import { State } from "@/state/State";
import { Queue } from "@/types";
import { IUnit } from "@/unit/IUnit";
import { Unit } from "@/unit/Unit";

export abstract class AbstractAgent implements IAgent {
  private readonly fsm: FiniteStateMachine = new FiniteStateMachine();
  private readonly idleState: IdleState;
  private readonly assignedGoapUnit: IUnit;

  /**
   * @param assignedUnit - the unit the agent works with
   */
  public constructor(assignedUnit: IUnit) {
    this.assignedGoapUnit = assignedUnit;
    this.idleState = new IdleState(this.generatePlannerObject());

    // Only subclasses of the own unit are able to emit events
    if (this.assignedGoapUnit instanceof Unit) {
      this.assignedGoapUnit.addImportantUnitGoalChangeListener(this);
    }

    this.idleState.addPlanCreatedListener(this);
    this.fsm.addPlanEventListener(this);
  }

  public update(): void {
    if (!this.fsm.hasStates()) {
      this.fsm.pushStack(this.idleState);
    }

    this.assignedGoapUnit.update();
    this.fsm.update(this.assignedGoapUnit);
  }

  public getAssignedGoapUnit(): IUnit {
    return this.assignedGoapUnit;
  }

  public onPlanCreated(plan: Queue<Action>): void {
    this.assignedGoapUnit.goapPlanFound(plan);

    this.fsm.popStack();
    this.fsm.pushStack(new RunActionState(this.fsm, plan));
  }

  public onImportantUnitGoalChange(state: State): void {
    state.importance = Infinity;
    this.fsm.pushStack(this.idleState);
  }

  public onImportantUnitStackResetChange(): void {
    // Reset all actions of the IUnit.
    for (const action of this.assignedGoapUnit.getAvailableActions()) {
      action.reset();
    }

    this.fsm.clearStack();
    this.fsm.pushStack(this.idleState);
  }

  public onPlanFailed(actions: Queue<Action>): void {
    this.assignedGoapUnit.goapPlanFailed(actions);
  }

  public onPlanFinished(): void {
    this.assignedGoapUnit.goapPlanFinished();
  }

  /**
   * Function for subclasses to provide an instance of a planner which is going to be used to create the action queue.
   *
   * @returns the used planner instance implementing planner interface
   */
  protected abstract generatePlannerObject(): IPlanner;
}
