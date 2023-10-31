import { Action } from "@/planner/Action";
import { IUnit } from "@/unit/IUnit";

export class ActionOne<T = unknown> extends Action<T> {
  public generateBaseCost(unit: IUnit): number {
    return 0;
  }

  public generateCostRelativeToTarget(unit: IUnit): number {
    return 0;
  }

  public checkProceduralPrecondition(unit: IUnit): boolean {
    return true;
  }

  public performAction(unit: IUnit): boolean {
    return true;
  }

  public isDone(unit: IUnit): boolean {
    return false;
  }

  public isInRange(unit: IUnit): boolean {
    return false;
  }

  public requiresInRange(unit: IUnit): boolean {
    return false;
  }

  public reset(): void {}
}
