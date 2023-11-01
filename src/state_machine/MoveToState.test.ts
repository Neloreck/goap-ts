import { describe, expect, it, jest } from "@jest/globals";

import { GenericAction } from "#/fixtures/mocks";

import { AbstractAction } from "@/AbstractAction";
import { MoveToState } from "@/state_machine/MoveToState";
import { IUnit } from "@/unit/IUnit";

describe("MoveToState class", () => {
  it("should correctly initialize", () => {
    const action: AbstractAction = new GenericAction(10);
    const state: MoveToState = new MoveToState(action);

    expect(state.action).toBe(action);
  });

  it("should correctly execute when range is not required", () => {
    const action: AbstractAction = new GenericAction(1);
    const state: MoveToState = new MoveToState(action);
    const unit: IUnit = { onMoveToTarget: jest.fn() } as unknown as IUnit;

    jest.spyOn(action, "requiresInRange").mockImplementation(jest.fn(() => false));
    jest.spyOn(action, "isInRange").mockImplementation(jest.fn(() => false));

    expect(state.execute(unit)).toBe(false);
    expect(action.requiresInRange).toHaveBeenCalledTimes(1);
    expect(action.requiresInRange).toHaveBeenCalledWith(unit);
    expect(action.isInRange).not.toHaveBeenCalled();
    expect(unit.onMoveToTarget).not.toHaveBeenCalled();
  });

  it("should correctly execute when range is required but not in range", () => {
    const target: IUnit = {} as IUnit;
    const action: AbstractAction = new GenericAction(target);
    const state: MoveToState = new MoveToState(action);
    const unit: IUnit = { onMoveToTarget: jest.fn() } as unknown as IUnit;

    jest.spyOn(action, "requiresInRange").mockImplementation(jest.fn(() => true));
    jest.spyOn(action, "isInRange").mockImplementation(jest.fn(() => false));

    expect(state.execute(unit)).toBe(true);
    expect(action.requiresInRange).toHaveBeenCalledTimes(1);
    expect(action.requiresInRange).toHaveBeenCalledWith(unit);
    expect(action.isInRange).toHaveBeenCalledTimes(1);
    expect(action.isInRange).toHaveBeenCalledWith(unit);
    expect(unit.onMoveToTarget).toHaveBeenCalledTimes(1);
    expect(unit.onMoveToTarget).toHaveBeenCalledWith(target);
  });

  it("should correctly execute when range is required and in range", () => {
    const target: IUnit = {} as IUnit;
    const action: AbstractAction = new GenericAction(target);
    const state: MoveToState = new MoveToState(action);
    const unit: IUnit = { onMoveToTarget: jest.fn() } as unknown as IUnit;

    jest.spyOn(action, "requiresInRange").mockImplementation(jest.fn(() => true));
    jest.spyOn(action, "isInRange").mockImplementation(jest.fn(() => true));

    expect(state.execute(unit)).toBe(false);
    expect(action.requiresInRange).toHaveBeenCalledTimes(1);
    expect(action.requiresInRange).toHaveBeenCalledWith(unit);
    expect(action.isInRange).toHaveBeenCalledTimes(1);
    expect(action.isInRange).toHaveBeenCalledWith(unit);
    expect(unit.onMoveToTarget).not.toHaveBeenCalled();
  });

  it("should correctly execute when range is required but not in range and target is missing", () => {
    const action: AbstractAction = new GenericAction({});
    const state: MoveToState = new MoveToState(action);
    const unit: IUnit = { onMoveToTarget: jest.fn() } as unknown as IUnit;

    jest.spyOn(action, "requiresInRange").mockImplementation(jest.fn(() => true));
    jest.spyOn(action, "isInRange").mockImplementation(jest.fn(() => false));

    action.target = null;

    expect(state.execute(unit)).toBe(false);
    expect(action.requiresInRange).toHaveBeenCalledTimes(1);
    expect(action.requiresInRange).toHaveBeenCalledWith(unit);
    expect(action.isInRange).toHaveBeenCalledTimes(1);
    expect(action.isInRange).toHaveBeenCalledWith(unit);
    expect(unit.onMoveToTarget).not.toHaveBeenCalled();
  });
});
