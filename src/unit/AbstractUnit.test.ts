import { describe, expect, it, jest } from "@jest/globals";

import { GenericAction } from "#/fixtures/mocks";

import { AbstractAction } from "@/AbstractAction";
import { IImportantUnitChangeEventListener } from "@/event/IImportantUnitChangeEventListener";
import { Property } from "@/Property";
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
    expect(unit.getActions()).toHaveLength(0);
    expect(unit.getWorldState()).toHaveLength(0);
  });

  it("should correctly handle world state", () => {
    const unit: Unit = new Unit();
    const exampleState: Array<Property> = [new Property("a", true), new Property("b", false), new Property("c", false)];

    expect(unit.getWorldState()).toHaveLength(0);

    unit.setWorldState(exampleState);

    expect(unit.getWorldState()).toBe(exampleState);

    const property: Property = new Property("d", true);

    unit.addWorldState(property);

    expect(exampleState).toHaveLength(4);
    expect(exampleState).toContain(property);

    unit.addWorldState(new Property("d", true));

    expect(exampleState).toHaveLength(4);
    expect(exampleState).toContain(property);

    unit.removeWorldStateProperty("d");

    expect(exampleState).toHaveLength(3);
    expect(exampleState).not.toContain(property);

    unit.removeWorldStateProperty("d");

    expect(exampleState).toHaveLength(3);
    expect(exampleState).not.toContain(property);

    unit.removeWorldStateProperty("a");
    unit.removeWorldStateProperty("b");
    unit.removeWorldStateProperty("c");

    expect(exampleState).toHaveLength(0);
  });

  it("should correctly handle goal state", () => {
    const unit: Unit = new Unit();
    const exampleState: Array<Property> = [new Property("a", true), new Property("b", false), new Property("c", false)];

    expect(unit.getGoalState()).toHaveLength(0);

    unit.setGoalState(exampleState);

    expect(unit.getGoalState()).toBe(exampleState);

    const property: Property = new Property("d", true);

    unit.addGoalState(property);

    expect(exampleState).toHaveLength(4);
    expect(exampleState).toContain(property);

    unit.addGoalState(new Property("d", true));

    expect(exampleState).toHaveLength(4);
    expect(exampleState).toContain(property);

    unit.removeGoalState("d");

    expect(exampleState).toHaveLength(3);
    expect(exampleState).not.toContain(property);

    unit.removeGoalState("d");

    expect(exampleState).toHaveLength(3);
    expect(exampleState).not.toContain(property);

    unit.removeGoalState("a");
    unit.removeGoalState("b");
    unit.removeGoalState("c");

    expect(exampleState).toHaveLength(0);
  });

  it("should correctly handle actions", () => {
    const unit: Unit = new Unit();
    const action: GenericAction = new GenericAction(1);
    const actions: Array<AbstractAction> = [action];

    expect(unit.getActions()).toHaveLength(0);

    unit.addAction(action);

    expect(unit.getActions()).not.toBe(actions);
    expect(unit.getActions()).toHaveLength(1);
    expect(unit.getActions()).toEqual([action]);

    unit.setActions(actions);

    expect(unit.getActions()).toBe(actions);
    expect(unit.getActions()).toHaveLength(1);

    unit.removeAction(new GenericAction(5));

    unit.removeAction(action);

    expect(unit.getActions()).toHaveLength(0);
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
    const property: Property = new Property("a", true);
    const listener: IImportantUnitChangeEventListener = {
      onImportantUnitGoalChange: jest.fn(),
      onImportantUnitStackReset: jest.fn(),
    };

    unit.addListener(listener);

    unit.dispatchNewImportantUnitStackResetEvent();

    expect(listener.onImportantUnitStackReset).toHaveBeenCalledTimes(1);
    expect(listener.onImportantUnitGoalChange).toHaveBeenCalledTimes(0);

    unit.dispatchNewImportantUnitGoalChangeEvent(property);

    expect(listener.onImportantUnitStackReset).toHaveBeenCalledTimes(1);
    expect(listener.onImportantUnitGoalChange).toHaveBeenCalledTimes(1);
    expect(listener.onImportantUnitGoalChange).toHaveBeenCalledWith(property);
  });

  it("should correctly change goal", () => {
    const unit: Unit = new Unit();
    const property: Property = new Property("a", false);
    const listener: IImportantUnitChangeEventListener = {
      onImportantUnitGoalChange: jest.fn(),
      onImportantUnitStackReset: jest.fn(),
    };

    unit.addListener(listener);
    unit.changeGoalImmediately(property);

    expect(listener.onImportantUnitGoalChange).toHaveBeenCalledTimes(1);
    expect(listener.onImportantUnitGoalChange).toHaveBeenCalledWith(property);
    expect(unit.getGoalState()).toHaveLength(1);
    expect(unit.getGoalState()).toContain(property);
  });
});
