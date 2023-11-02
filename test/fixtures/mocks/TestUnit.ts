import { jest } from "@jest/globals";

import { Plan } from "@/alias";
import { AbstractUnit } from "@/unit/AbstractUnit";

export class TestUnit extends AbstractUnit {
  public onGoapPlanFound = jest.fn((actions: Plan): void => {});

  public onGoapPlanFailed = jest.fn((actions: Plan): void => {});

  public onGoapPlanFinished = jest.fn();

  public update = jest.fn();

  public onMoveToTarget = jest.fn((target: unknown): boolean => {
    return false;
  });
}
