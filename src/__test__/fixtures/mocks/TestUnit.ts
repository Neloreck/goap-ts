import { Action } from "@/planner/Action";
import { Queue } from "@/types";
import { Unit } from "@/unit/Unit";

export class TestUnit extends Unit {
  public goapPlanFound(actions: Queue<Action>): void {}

  public goapPlanFailed(actions: Queue<Action>): void {}

  public goapPlanFinished(): void {}

  public update(): void {}

  public moveTo(target: unknown): boolean {
    return false;
  }
}
