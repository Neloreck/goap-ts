import { describe, expect, it, jest } from "@jest/globals";

import { GenericAction } from "#/fixtures/mocks";

import { AbstractAction } from "@/AbstractAction";
import { IPlanCreatedEventListener } from "@/event/IPlanCreatedEventListener";
import { IPlanner } from "@/planner/IPlanner";
import { IdleState } from "@/state_machine/IdleState";
import { Queue } from "@/types";
import { IUnit } from "@/unit/IUnit";

describe("IdleState class", () => {
  it("should correctly initialize", () => {
    const planner: IPlanner = { plan: jest.fn(() => null) } as IPlanner;
    const state: IdleState = new IdleState(planner);
    const unit: IUnit = {} as IUnit;

    expect(state.execute(unit)).toBe(false);
    expect(planner.plan).toHaveBeenCalledTimes(1);
    expect(planner.plan).toHaveBeenCalledWith(unit);
  });

  it("should correctly emit events when plan is created", () => {
    const plan: Queue<AbstractAction> = [new GenericAction(1), new GenericAction(2)];
    const planner: IPlanner = { plan: jest.fn(() => null) } as IPlanner;
    const listener: IPlanCreatedEventListener = { onPlanCreated: jest.fn() };
    const state: IdleState = new IdleState(planner);
    const unit: IUnit = {} as IUnit;

    state.addListener(listener);

    expect(state.execute(unit)).toBe(false);
    expect(state.getListeners()).toEqual([listener]);
    expect(listener.onPlanCreated).not.toHaveBeenCalled();

    jest.spyOn(planner, "plan").mockImplementation(() => plan);

    expect(state.execute(unit)).toBe(false);
    expect(listener.onPlanCreated).toHaveBeenCalledTimes(1);
    expect(listener.onPlanCreated).toHaveBeenCalledWith(plan);

    expect(state.execute(unit)).toBe(false);
    expect(listener.onPlanCreated).toHaveBeenCalledTimes(2);
    expect(listener.onPlanCreated).toHaveBeenNthCalledWith(2, plan);

    state.removeListener(listener);

    expect(state.execute(unit)).toBe(false);
    expect(state.getListeners()).toEqual([]);
    expect(listener.onPlanCreated).toHaveBeenCalledTimes(2);
  });
});
