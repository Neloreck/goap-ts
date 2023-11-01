import { jest } from "@jest/globals";

import { AbstractAction } from "@/AbstractAction";
import { Queue } from "@/types";
import { AbstractUnit } from "@/unit/AbstractUnit";

export class TestUnit extends AbstractUnit {
  public onGoapPlanFound = jest.fn((actions: Queue<AbstractAction>): void => {});

  public onGoapPlanFailed = jest.fn((actions: Queue<AbstractAction>): void => {});

  public onGoapPlanFinished = jest.fn();

  public update = jest.fn();

  public onMoveToTarget = jest.fn((target: unknown): boolean => {
    return false;
  });
}
