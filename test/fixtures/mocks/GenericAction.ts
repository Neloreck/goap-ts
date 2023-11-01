import { jest } from "@jest/globals";

import { AbstractAction } from "@/AbstractAction";
import { IUnit } from "@/unit/IUnit";

export class GenericAction<T = unknown> extends AbstractAction<T> {
  public generateBaseCost(unit: IUnit): number {
    return 0;
  }

  public generateCostRelativeToTarget = jest.fn((unit: IUnit): number => {
    return 0;
  });

  public checkProceduralPrecondition = jest.fn((unit: IUnit): boolean => {
    return true;
  });

  public performAction = jest.fn((unit: IUnit): boolean => {
    return true;
  });

  public isFinished = jest.fn((unit: IUnit): boolean => {
    return false;
  });

  public isInRange = jest.fn((unit: IUnit): boolean => {
    return false;
  });

  public requiresInRange = jest.fn((unit: IUnit): boolean => {
    return false;
  });

  public reset = jest.fn();
}
