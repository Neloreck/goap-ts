import { describe, expect, it, jest } from "@jest/globals";

import { TestUnit } from "#/fixtures/mocks";

import { AbstractAction } from "@/AbstractAction";
import { State } from "@/State";
import { IUnit } from "@/unit/IUnit";

describe("AbstractAction class", () => {
  class Action<T = unknown> extends AbstractAction<T> {
    public generateBaseCost = jest.fn((unit: IUnit): number => {
      return 1;
    });

    public generateCostRelativeToTarget = jest.fn((unit: IUnit): number => {
      return 2;
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

  it("should correctly initialize with mocked methods", () => {
    const unit: TestUnit = new TestUnit();
    const action: Action = new Action(unit);

    expect(action.target).toBe(unit);
    expect(action.generateBaseCost(unit)).toBe(1);
    expect(action.generateCostRelativeToTarget(unit)).toBe(2);
    expect(action.checkProceduralPrecondition(unit)).toBe(true);
    expect(action.performAction(unit)).toBe(true);
    expect(action.isFinished(unit)).toBe(false);
    expect(action.isInRange(unit)).toBe(false);
    expect(action.requiresInRange(unit)).toBe(false);
    expect(() => action.reset()).not.toThrow();

    expect([...action.getPreconditions()]).toEqual([]);
    expect([...action.getEffects()]).toEqual([]);
  });

  it("should correctly handle add preconditions", () => {
    const unit: TestUnit = new TestUnit();
    const action: Action = new Action(unit);
    const first: State = new State(1, "test_1", true);
    const second: State = new State(2, "test_2", false);

    expect([...action.getPreconditions()]).toEqual([]);

    action.addPrecondition(first);
    action.addPrecondition(second);

    expect([...action.getPreconditions()]).toEqual([first, second]);

    action.addPrecondition(first);
    action.addPrecondition(second);

    expect([...action.getPreconditions()]).toEqual([first, second]);
  });

  it("should correctly handle remove preconditions", () => {
    const unit: TestUnit = new TestUnit();
    const action: Action = new Action(unit);
    const first: State = new State(1, "test_1", true);
    const second: State = new State(2, "test_2", false);

    expect([...action.getPreconditions()]).toEqual([]);

    action.addPrecondition(first);
    action.addPrecondition(second);

    expect([...action.getPreconditions()]).toEqual([first, second]);

    action.removePrecondition(second);

    expect([...action.getPreconditions()]).toEqual([first]);

    action.removePrecondition(second);

    expect([...action.getPreconditions()]).toEqual([first]);

    action.removePrecondition("test_2");

    expect([...action.getPreconditions()]).toEqual([first]);

    action.removePrecondition("test_1");

    expect([...action.getPreconditions()]).toEqual([]);
  });

  it("should correctly handle add effects", () => {
    const unit: TestUnit = new TestUnit();
    const action: Action = new Action(unit);
    const first: State = new State(1, "test_1", true);
    const second: State = new State(2, "test_2", false);

    expect([...action.getEffects()]).toEqual([]);

    action.addEffect(first);
    action.addEffect(second);

    expect([...action.getEffects()]).toEqual([first, second]);

    action.addEffect(first);
    action.addEffect(second);

    expect([...action.getEffects()]).toEqual([first, second]);
  });

  it("should correctly handle remove effects", () => {
    const unit: TestUnit = new TestUnit();
    const action: Action = new Action(unit);
    const first: State = new State(1, "test_1", true);
    const second: State = new State(2, "test_2", false);

    expect([...action.getEffects()]).toEqual([]);

    action.addEffect(first);
    action.addEffect(second);

    expect([...action.getEffects()]).toEqual([first, second]);

    action.removeEffect(second);

    expect([...action.getEffects()]).toEqual([first]);

    action.removeEffect(second);

    expect([...action.getEffects()]).toEqual([first]);

    action.removeEffect("test_2");

    expect([...action.getEffects()]).toEqual([first]);

    action.removeEffect("test_1");

    expect([...action.getEffects()]).toEqual([]);
  });
});
