import { describe, expect, it, jest } from "@jest/globals";

import { GenericAction } from "#/fixtures/mocks";

import { AbstractAction } from "@/AbstractAction";
import { FiniteStateMachine } from "@/state_machine/FiniteStateMachine";
import { MoveToState } from "@/state_machine/MoveToState";
import { RunActionState } from "@/state_machine/RunActionState";
import { Queue } from "@/types";
import { IUnit } from "@/unit/IUnit";

describe("RunActionState class", () => {
  it("should correctly initialize", () => {
    const fsm: FiniteStateMachine = new FiniteStateMachine();
    const plan: Queue<AbstractAction> = [new GenericAction(1), new GenericAction(2)];
    const state: RunActionState = new RunActionState(fsm, plan);

    expect(state.getCurrentPlan()).toBe(plan);
  });

  it("should correctly handle throw NotPerformableActionException if action condition fails", () => {
    const first: AbstractAction = new GenericAction(1);
    const second: AbstractAction = new GenericAction(1);
    const fsm: FiniteStateMachine = new FiniteStateMachine();
    const plan: Queue<AbstractAction> = [first, second];
    const state: RunActionState = new RunActionState(fsm, plan);

    jest.spyOn(first, "performAction").mockImplementation(() => false);
    expect(state.execute({} as IUnit)).toBe(false);
  });

  it("should correctly handle empty plan", () => {
    const fsm: FiniteStateMachine = new FiniteStateMachine();
    const plan: Queue<AbstractAction> = [];
    const state: RunActionState = new RunActionState(fsm, plan);

    expect(state.execute({} as IUnit)).toBe(false);
  });

  it("should correctly remove all actions that are done and reset them", () => {
    const first: AbstractAction = new GenericAction(1);
    const second: AbstractAction = new GenericAction(1);
    const fsm: FiniteStateMachine = new FiniteStateMachine();
    const plan: Queue<AbstractAction> = [first, second];
    const state: RunActionState = new RunActionState(fsm, plan);

    jest.spyOn(first, "isFinished").mockImplementation(() => true);
    jest.spyOn(first, "reset").mockImplementation(() => {});
    jest.spyOn(second, "isFinished").mockImplementation(() => true);
    jest.spyOn(second, "reset").mockImplementation(() => {});

    expect(state.execute({} as IUnit)).toBe(false);
    expect(state.getCurrentPlan()).toEqual([]);

    expect(first.isFinished).toHaveBeenCalledTimes(1);
    expect(first.reset).toHaveBeenCalledTimes(1);
    expect(second.isFinished).toHaveBeenCalledTimes(1);
    expect(second.reset).toHaveBeenCalledTimes(1);
  });

  it("should correctly handle not completed actions and execute them", () => {
    const first: AbstractAction = new GenericAction(1);
    const second: AbstractAction = new GenericAction(1);
    const third: AbstractAction = new GenericAction(1);
    const fsm: FiniteStateMachine = new FiniteStateMachine();
    const plan: Queue<AbstractAction> = [first, second, third];
    const state: RunActionState = new RunActionState(fsm, plan);
    const unit: IUnit = {} as IUnit;

    jest.spyOn(first, "isFinished").mockImplementation(() => true);
    jest.spyOn(first, "reset").mockImplementation(() => {});

    jest.spyOn(second, "requiresInRange").mockImplementation(() => true);
    jest.spyOn(second, "isInRange").mockImplementation(() => true);

    expect(state.execute(unit)).toBe(true);
    expect(state.getCurrentPlan()).toEqual([second, third]);

    expect(first.isFinished).toHaveBeenCalledTimes(1);
    expect(first.reset).toHaveBeenCalledTimes(1);
    expect(second.checkProceduralPrecondition).toHaveBeenCalledTimes(1);
    expect(second.checkProceduralPrecondition).toHaveBeenCalledWith(unit);
    expect(second.performAction).toHaveBeenCalledTimes(1);
    expect(second.performAction).toHaveBeenCalledWith(unit);
    expect(third.checkProceduralPrecondition).not.toHaveBeenCalled();
    expect(third.performAction).not.toHaveBeenCalled();

    expect(state.execute(unit)).toBe(true);
    expect(state.getCurrentPlan()).toEqual([second, third]);
    expect(second.performAction).toHaveBeenCalledTimes(2);
    expect(third.performAction).not.toHaveBeenCalled();

    jest.spyOn(second, "checkProceduralPrecondition").mockImplementation(() => false);

    expect(state.execute(unit)).toBe(true);
    expect(state.getCurrentPlan()).toEqual([second, third]);
    expect(second.performAction).toHaveBeenCalledTimes(2);
    expect(third.performAction).not.toHaveBeenCalled();
  });

  it("should correctly add react target state to FSM if needed", () => {
    const first: AbstractAction = new GenericAction(1);
    const second: AbstractAction = new GenericAction(1);
    const third: AbstractAction = new GenericAction(1);
    const fsm: FiniteStateMachine = new FiniteStateMachine();
    const plan: Queue<AbstractAction> = [first, second, third];
    const state: RunActionState = new RunActionState(fsm, plan);
    const unit: IUnit = {} as IUnit;

    fsm.push(state);

    jest.spyOn(first, "isFinished").mockImplementation(() => true);
    jest.spyOn(first, "reset").mockImplementation(() => {});

    jest.spyOn(second, "requiresInRange").mockImplementation(() => true);
    jest.spyOn(second, "isInRange").mockImplementation(() => false);

    expect(state.execute(unit)).toBe(true);
    expect(state.getCurrentPlan()).toEqual([second, third]);

    expect(first.isFinished).toHaveBeenCalledTimes(1);
    expect(first.reset).toHaveBeenCalledTimes(1);
    expect(second.checkProceduralPrecondition).not.toHaveBeenCalled();
    expect(second.performAction).not.toHaveBeenCalled();
    expect(third.checkProceduralPrecondition).not.toHaveBeenCalled();
    expect(third.performAction).not.toHaveBeenCalled();

    // Verify that move to target state is pushed.
    expect(fsm.getStack()).toEqual([state, new MoveToState(second)]);
  });
});
