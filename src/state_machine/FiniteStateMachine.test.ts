import { describe, expect, it, jest } from "@jest/globals";

import { GenericAction } from "#/fixtures/mocks";

import { Plan } from "@/alias";
import { IFiniteStateMachinePlanEventListener } from "@/event/IFiniteStateMachinePlanEventListener";
import { AbstractPlanner } from "@/planner/AbstractPlanner";
import { FiniteStateMachine } from "@/state_machine/FiniteStateMachine";
import { IdleState } from "@/state_machine/IdleState";
import { MoveToState } from "@/state_machine/MoveToState";
import { RunActionState } from "@/state_machine/RunActionState";
import { IUnit } from "@/unit/IUnit";

describe("FiniteStateMachine class", () => {
  it("should correctly initialize", () => {
    const fsm: FiniteStateMachine = new FiniteStateMachine();

    expect(fsm.getStack()).toEqual([]);
    expect(fsm.hasAny()).toBe(false);
  });

  it("should correctly initialize handle pop/push/get", () => {
    const fsm: FiniteStateMachine = new FiniteStateMachine();
    const moveToState: MoveToState = new MoveToState(new GenericAction(1));
    const actState: RunActionState = new RunActionState(fsm, [new GenericAction(2), new GenericAction(3)]);
    const idleState: IdleState = new IdleState({} as AbstractPlanner);

    expect(fsm.getStack()).toEqual([]);
    expect(fsm.pop()).toBeUndefined();
    expect(fsm.hasAny()).toBe(false);
    expect(fsm.isEmpty()).toBe(true);

    fsm.push(idleState);
    fsm.push(actState);
    fsm.push(moveToState);

    expect(fsm.hasAny()).toBe(true);
    expect(fsm.isEmpty()).toBe(false);
    expect(fsm.getStack()).toEqual([idleState, actState, moveToState]);
    expect(fsm.pop()).toBe(moveToState);
    expect(fsm.getStack()).toEqual([idleState, actState]);
    expect(fsm.pop()).toBe(actState);
    expect(fsm.getStack()).toEqual([idleState]);
    expect(fsm.pop()).toBe(idleState);
    expect(fsm.getStack()).toEqual([]);
    expect(fsm.pop()).toBeUndefined();
    expect(fsm.getStack()).toEqual([]);

    fsm.push(idleState);
    fsm.push(actState);

    expect(fsm.isEmpty()).toBe(false);
    expect(fsm.hasAny()).toBe(true);
    expect(fsm.getStack()).toEqual([idleState, actState]);

    fsm.clear();

    expect(fsm.isEmpty()).toBe(true);
    expect(fsm.hasAny()).toBe(false);
    expect(fsm.getStack()).toEqual([]);
  });

  it("should correctly update when empty", () => {
    const fsm: FiniteStateMachine = new FiniteStateMachine();
    const listener: IFiniteStateMachinePlanEventListener = { onPlanFailed: jest.fn(), onPlanFinished: jest.fn() };
    const unit: IUnit = {} as IUnit;

    fsm.addEventListener(listener);

    fsm.update(unit);
    fsm.update(unit);
    fsm.update(unit);

    expect(fsm.getListeners()).toEqual([listener]);

    expect(listener.onPlanFinished).not.toHaveBeenCalled();
    expect(listener.onPlanFailed).not.toHaveBeenCalled();
  });

  it("should correctly update and handle perform action emit event", () => {
    const fsm: FiniteStateMachine = new FiniteStateMachine();
    const listener: IFiniteStateMachinePlanEventListener = { onPlanFailed: jest.fn(), onPlanFinished: jest.fn() };
    const actState: RunActionState = new RunActionState(fsm, [new GenericAction(2), new GenericAction(3)]);
    const unit: IUnit = {} as IUnit;

    fsm.addEventListener(listener);
    fsm.push(actState);

    jest.spyOn(actState, "execute").mockImplementation(() => false);

    fsm.update(unit);
    fsm.update(unit);

    expect(listener.onPlanFinished).not.toHaveBeenCalled();
    expect(listener.onPlanFailed).not.toHaveBeenCalled();
    expect(fsm.getStack()).toEqual([actState]);

    jest.spyOn(actState, "execute").mockImplementation(() => true);

    fsm.update(unit);

    expect(listener.onPlanFinished).toHaveBeenCalledTimes(1);
    expect(listener.onPlanFinished).toHaveBeenCalled();
    expect(listener.onPlanFailed).not.toHaveBeenCalled();
    expect(fsm.getStack()).toEqual([]);
  });

  it("should correctly update and handle errors", () => {
    const fsm: FiniteStateMachine = new FiniteStateMachine();
    const listener: IFiniteStateMachinePlanEventListener = { onPlanFailed: jest.fn(), onPlanFinished: jest.fn() };
    const unit: IUnit = {} as IUnit;

    const somePlan: Plan = [new GenericAction(5), new GenericAction(32)];
    const anotherActState: RunActionState = new RunActionState(fsm, somePlan);
    const actState: RunActionState = new RunActionState(fsm, [new GenericAction(2), new GenericAction(3)]);
    const idleState: IdleState = new IdleState({} as AbstractPlanner);

    fsm.addEventListener(listener);
    fsm.push(idleState);
    fsm.push(actState);
    fsm.push(anotherActState);

    jest.spyOn(anotherActState, "execute").mockImplementation(() => {
      throw new Error("test-error");
    });

    expect(fsm.getListeners()).toEqual([listener]);
    expect(fsm.getStack()).toEqual([idleState, actState, anotherActState]);

    fsm.update(unit);

    expect(listener.onPlanFinished).not.toHaveBeenCalled();
    expect(listener.onPlanFailed).toHaveBeenCalledWith(somePlan);
    expect(fsm.getStack()).toEqual([idleState, actState]);

    fsm.push(anotherActState);
    fsm.update(unit);

    expect(listener.onPlanFailed).toHaveBeenCalledTimes(2);

    fsm.removeEventListener(listener);

    fsm.push(anotherActState);
    fsm.update(unit);

    expect(fsm.getListeners()).toEqual([]);
    expect(listener.onPlanFailed).toHaveBeenCalledTimes(2);
  });

  it("should correctly update and emit events", () => {
    const fsm: FiniteStateMachine = new FiniteStateMachine();
    const moveToState: MoveToState = new MoveToState(new GenericAction(1));
    const actState: RunActionState = new RunActionState(fsm, [new GenericAction(2), new GenericAction(3)]);
    const idleState: IdleState = new IdleState({} as AbstractPlanner);

    fsm.push(idleState);
    fsm.push(actState);
    fsm.push(moveToState);
  });
});
