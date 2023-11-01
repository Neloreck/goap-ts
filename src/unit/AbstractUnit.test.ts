import { describe, expect, it, jest } from "@jest/globals";

import { GenericAction } from "#/fixtures/mocks";

import { AbstractAction } from "@/AbstractAction";
import { IImportantUnitChangeEventListener } from "@/event/IImportantUnitChangeEventListener";
import { State } from "@/State";
import { Queue } from "@/types";
import { AbstractUnit } from "@/unit/AbstractUnit";

describe("AbstractUnit class", () => {
  class Unit extends AbstractUnit {
    public onGoapPlanFound = jest.fn((actions: Queue<AbstractAction>): void => {});

    public onGoapPlanFailed = jest.fn((actions: Queue<AbstractAction>): void => {});

    public onGoapPlanFinished = jest.fn();

    public update = jest.fn();

    public onMoveToTarget = jest.fn((target: unknown): boolean => {
      return false;
    });
  }

  it("should correctly initialize", () => {
    const unit: Unit = new Unit();

    expect(unit.getListeners()).toHaveLength(0);
    expect(unit.getGoalState()).toHaveLength(0);
    expect(unit.getActions().size).toBe(0);
    expect(unit.getWorldState().size).toBe(0);
  });

  it("should correctly handle world state", () => {
    const unit: Unit = new Unit();
    const exampleState: Set<State> = new Set([
      new State(0, "a", true),
      new State(0, "b", false),
      new State(0, "c", false),
    ]);

    expect(unit.getWorldState().size).toBe(0);

    unit.setWorldState(exampleState);

    expect(unit.getWorldState()).toBe(exampleState);

    const state: State = new State(0, "d", true);

    unit.addWorldState(state);

    expect(exampleState.size).toBe(4);
    expect(exampleState.has(state)).toBe(true);

    unit.addWorldState(new State(0, "d", true));

    expect(exampleState.size).toBe(4);
    expect(exampleState.has(state)).toBe(true);

    unit.removeWorldStateProperty("d");

    expect(exampleState.size).toBe(3);
    expect(exampleState.has(state)).toBe(false);

    unit.removeWorldStateProperty("d");

    expect(exampleState.size).toBe(3);
    expect(exampleState.has(state)).toBe(false);

    unit.removeWorldStateProperty("a");
    unit.removeWorldStateProperty("b");
    unit.removeWorldStateProperty("c");

    expect(exampleState.size).toBe(0);
  });

  it("should correctly handle goal state", () => {
    const unit: Unit = new Unit();
    const exampleState: Array<State> = [new State(0, "a", true), new State(0, "b", false), new State(0, "c", false)];

    expect(unit.getGoalState()).toHaveLength(0);

    unit.setGoalState(exampleState);

    expect(unit.getGoalState()).toBe(exampleState);

    const state: State = new State(0, "d", true);

    unit.addGoalState(state);

    expect(exampleState).toHaveLength(4);
    expect(exampleState).toContain(state);

    unit.addGoalState(new State(0, "d", true));

    expect(exampleState).toHaveLength(4);
    expect(exampleState).toContain(state);

    unit.removeGoalState("d");

    expect(exampleState).toHaveLength(3);
    expect(exampleState).not.toContain(state);

    unit.removeGoalState("d");

    expect(exampleState).toHaveLength(3);
    expect(exampleState).not.toContain(state);

    unit.removeGoalState("a");
    unit.removeGoalState("b");
    unit.removeGoalState("c");

    expect(exampleState).toHaveLength(0);
  });

  it("should correctly handle actions", () => {
    const unit: Unit = new Unit();
    const action: GenericAction = new GenericAction(1);
    const actions: Set<AbstractAction> = new Set([action]);

    expect(unit.getActions().size).toBe(0);

    unit.addAction(action);

    expect(unit.getActions()).not.toBe(actions);
    expect(unit.getActions().size).toBe(1);
    expect([...unit.getActions()]).toEqual([action]);

    unit.setActions(actions);

    expect(unit.getActions()).toBe(actions);
    expect(unit.getActions().size).toBe(1);

    unit.removeAction(new GenericAction(5));

    unit.removeAction(action);

    expect(unit.getActions().size).toBe(0);
  });

  it("should correctly handle reset actions event", () => {
    const unit: Unit = new Unit();
    const listener: IImportantUnitChangeEventListener = {
      onImportantUnitGoalChange: jest.fn(),
      onImportantUnitStackReset: jest.fn(),
    };

    unit.addListener(listener);
    unit.resetActions();

    expect(listener.onImportantUnitStackReset).toHaveBeenCalledTimes(1);
  });

  it("should correctly handle listeners", () => {
    const unit: Unit = new Unit();
    const listener: IImportantUnitChangeEventListener = {
      onImportantUnitGoalChange: jest.fn(),
      onImportantUnitStackReset: jest.fn(),
    };

    expect(unit.getListeners()).toEqual([]);

    unit.addListener(listener);
    expect(unit.getListeners()).toEqual([listener]);

    unit.removeListener(listener);
    expect(unit.getListeners()).toEqual([]);
  });

  it("should correctly emit events", () => {
    const unit: Unit = new Unit();
    const state: State = new State(0, "a", true);
    const listener: IImportantUnitChangeEventListener = {
      onImportantUnitGoalChange: jest.fn(),
      onImportantUnitStackReset: jest.fn(),
    };

    unit.addListener(listener);

    unit.dispatchNewImportantUnitStackResetEvent();

    expect(listener.onImportantUnitStackReset).toHaveBeenCalledTimes(1);
    expect(listener.onImportantUnitGoalChange).toHaveBeenCalledTimes(0);

    unit.dispatchNewImportantUnitGoalChangeEvent(state);

    expect(listener.onImportantUnitStackReset).toHaveBeenCalledTimes(1);
    expect(listener.onImportantUnitGoalChange).toHaveBeenCalledTimes(1);
    expect(listener.onImportantUnitGoalChange).toHaveBeenCalledWith(state);
  });

  it("should correctly change goal", () => {
    const unit: Unit = new Unit();
    const state: State = new State(0, "a", false);
    const listener: IImportantUnitChangeEventListener = {
      onImportantUnitGoalChange: jest.fn(),
      onImportantUnitStackReset: jest.fn(),
    };

    unit.addListener(listener);
    unit.changeGoalImmediately(state);

    expect(listener.onImportantUnitGoalChange).toHaveBeenCalledTimes(1);
    expect(listener.onImportantUnitGoalChange).toHaveBeenCalledWith(state);
    expect(unit.getGoalState()).toHaveLength(1);
    expect(unit.getGoalState()).toContain(state);
  });
});
