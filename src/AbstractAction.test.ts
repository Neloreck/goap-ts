import { describe, expect, it, jest } from "@jest/globals";

import { TestUnit } from "#/fixtures/mocks";

import { AbstractAction } from "@/AbstractAction";
import { Property } from "@/property/Property";
import { IUnit } from "@/unit/IUnit";

describe("AbstractAction class", () => {
  class Action<T = unknown> extends AbstractAction<T> {
    public generateBaseCost = jest.fn((unit: IUnit): number => {
      return 1;
    });

    public generateCostRelativeToTarget = jest.fn((unit: IUnit): number => {
      return 2;
    });

    public isAvailable = jest.fn((unit: IUnit): boolean => {
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

  it("should correctly initialize with mocked methods", () => {
    const unit: TestUnit = new TestUnit();
    const action: Action = new Action(unit);

    expect(action.target).toBe(unit);
    expect(action.generateBaseCost(unit)).toBe(1);
    expect(action.generateCostRelativeToTarget(unit)).toBe(2);
    expect(action.isAvailable(unit)).toBe(true);
    expect(action.performAction(unit)).toBe(true);
    expect(action.isFinished(unit)).toBe(false);
    expect(action.isInRange(unit)).toBe(false);
    expect(action.requiresInRange(unit)).toBe(false);
    expect(() => action.reset()).not.toThrow();

    expect(action.preconditions).toEqual([]);
    expect(action.effects).toEqual([]);
  });

  it("should correctly handle add preconditions", () => {
    const unit: TestUnit = new TestUnit();
    const action: Action = new Action(unit);
    const first: Property = new Property("test_1", true);
    const second: Property = new Property("test_2", false);

    expect(action.preconditions).toEqual([]);

    action.addPrecondition(first).addPrecondition(second);

    expect(action.preconditions).toEqual([first, second]);

    action.addPrecondition(first).addPrecondition(second);

    expect(action.preconditions).toEqual([first, second]);
  });

  it("should correctly handle remove preconditions", () => {
    const unit: TestUnit = new TestUnit();
    const action: Action = new Action(unit);
    const first: Property = new Property("test_1", true);
    const second: Property = new Property("test_2", false);

    expect(action.preconditions).toEqual([]);

    action.addPrecondition(first).addPrecondition(second);

    expect(action.preconditions).toEqual([first, second]);

    action.removePrecondition(second.id);

    expect(action.preconditions).toEqual([first]);

    action.removePrecondition(second.id);

    expect(action.preconditions).toEqual([first]);

    action.removePrecondition("test_2");

    expect(action.preconditions).toEqual([first]);

    action.removePrecondition("test_1");

    expect(action.preconditions).toEqual([]);
  });

  it("should correctly handle add effects", () => {
    const unit: TestUnit = new TestUnit();
    const action: Action = new Action(unit);
    const first: Property = new Property("test_1", true);
    const second: Property = new Property("test_2", false);

    expect(action.effects).toEqual([]);

    action.addEffect(first).addEffect(second);

    expect(action.effects).toEqual([first, second]);

    action.addEffect(first).addEffect(second);

    expect(action.effects).toEqual([first, second]);
  });

  it("should correctly handle remove effects", () => {
    const unit: TestUnit = new TestUnit();
    const action: Action = new Action(unit);
    const first: Property = new Property("test_1", true);
    const second: Property = new Property("test_2", false);

    expect(action.effects).toEqual([]);

    action.addEffect(first).addEffect(second);

    expect(action.effects).toEqual([first, second]);

    action.removeEffect(second.id);

    expect(action.effects).toEqual([first]);

    action.removeEffect(second.id).removeEffect(second.id);

    expect(action.effects).toEqual([first]);

    action.removeEffect("test_2");

    expect(action.effects).toEqual([first]);

    action.removeEffect("test_1");

    expect(action.effects).toEqual([]);
  });
});
