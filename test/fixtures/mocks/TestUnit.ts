import { AbstractAction } from "@/AbstractAction";
import { Queue } from "@/types";
import { Unit } from "@/unit/Unit";

export class TestUnit extends Unit {
  public goapPlanFound(actions: Queue<AbstractAction>): void {}

  public goapPlanFailed(actions: Queue<AbstractAction>): void {}

  public goapPlanFinished(): void {}

  public update(): void {}

  public moveTo(target: unknown): boolean {
    return false;
  }
}
