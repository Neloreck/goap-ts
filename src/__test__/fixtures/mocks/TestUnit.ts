import { ActionOne } from "@/__test__/fixtures/mocks/ActionOne";
import { ActionThree } from "@/__test__/fixtures/mocks/ActionThree";
import { ActionTwo } from "@/__test__/fixtures/mocks/ActionTwo";
import { Action } from "@/planner/Action";
import { State } from "@/state/State";
import { Queue } from "@/types";
import { Unit } from "@/unit/Unit";

export class TestUnit extends Unit {
  public tOne: ActionOne = new ActionOne(1);
  public tTwo: ActionTwo = new ActionTwo(1);
  public tThree: ActionThree = new ActionThree(1);
  public goalS: State = new State(1, "goal", true);
  public worldS: State = new State(0, "goal", false);

  public TestUnit() {}

  public goapPlanFound(actions: Queue<Action>): void {}

  public goapPlanFailed(actions: Queue<Action>): void {}

  public goapPlanFinished(): void {}

  public update(): void {}

  public moveTo(target: unknown): boolean {
    return false;
  }

  public addGS(goal: State): void {
    this.addGoalState(goal);
  }

  public addWS(worldState: State): void {
    this.addWorldState(worldState);
  }

  public addAA(action: Action): void {
    this.addAvailableAction(action);
  }
}
