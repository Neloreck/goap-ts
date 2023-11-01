import { describe, expect, it, jest } from "@jest/globals";

import { GenericAction } from "#/fixtures/mocks";

import { AbstractAction } from "@/AbstractAction";
import { IFiniteStateMachinePlanEventListener } from "@/event/IFiniteStateMachinePlanEventListener";
import { AbstractPlanner } from "@/planner/AbstractPlanner";
import { FiniteStateMachine } from "@/state_machine/FiniteStateMachine";
import { IdleState } from "@/state_machine/IdleState";
import { MoveToState } from "@/state_machine/MoveToState";
import { RunActionState } from "@/state_machine/RunActionState";
import { Queue } from "@/types";
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

    fsm.push(idleState);
    fsm.push(actState);
    fsm.push(moveToState);

    expect(fsm.hasAny()).toBe(true);
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

    expect(fsm.hasAny()).toBe(true);
    expect(fsm.getStack()).toEqual([idleState, actState]);

    fsm.clear();

    expect(fsm.hasAny()).toBe(false);
    expect(fsm.getStack()).toEqual([]);
  });

  it("should correctly update when empty", () => {
    const fsm: FiniteStateMachine = new FiniteStateMachine();
    const eventListener: IFiniteStateMachinePlanEventListener = { onPlanFailed: jest.fn(), onPlanFinished: jest.fn() };
    const unit: IUnit = {} as IUnit;

    fsm.addEventListener(eventListener);

    fsm.update(unit);
    fsm.update(unit);
    fsm.update(unit);

    expect(eventListener.onPlanFinished).not.toHaveBeenCalled();
    expect(eventListener.onPlanFailed).not.toHaveBeenCalled();
  });

  it("should correctly update and handle perform action emit event", () => {
    const fsm: FiniteStateMachine = new FiniteStateMachine();
    const eventListener: IFiniteStateMachinePlanEventListener = { onPlanFailed: jest.fn(), onPlanFinished: jest.fn() };
    const actState: RunActionState = new RunActionState(fsm, [new GenericAction(2), new GenericAction(3)]);
    const unit: IUnit = {} as IUnit;

    fsm.addEventListener(eventListener);
    fsm.push(actState);

    jest.spyOn(actState, "execute").mockImplementation(() => true);

    fsm.update(unit);
    fsm.update(unit);

    expect(eventListener.onPlanFinished).not.toHaveBeenCalled();
    expect(eventListener.onPlanFailed).not.toHaveBeenCalled();
    expect(fsm.getStack()).toEqual([actState]);

    jest.spyOn(actState, "execute").mockImplementation(() => false);

    fsm.update(unit);

    expect(eventListener.onPlanFinished).toHaveBeenCalledTimes(1);
    expect(eventListener.onPlanFinished).toHaveBeenCalled();
    expect(eventListener.onPlanFailed).not.toHaveBeenCalled();
    expect(fsm.getStack()).toEqual([]);
  });

  it("should correctly update and handle errors", () => {
    const fsm: FiniteStateMachine = new FiniteStateMachine();
    const listener: IFiniteStateMachinePlanEventListener = { onPlanFailed: jest.fn(), onPlanFinished: jest.fn() };
    const unit: IUnit = {} as IUnit;

    const somePlan: Queue<AbstractAction> = [new GenericAction(5), new GenericAction(32)];
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
