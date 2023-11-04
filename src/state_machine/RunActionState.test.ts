import { describe, expect, it, jest } from "@jest/globals";

import { GenericAction } from "#/fixtures/mocks";

import { AbstractAction } from "@/AbstractAction";
import { Plan } from "@/alias";
import { IErrorHandler, NotPerformableActionError, SilentErrorHandler } from "@/error";
import { FiniteStateMachine } from "@/state_machine/FiniteStateMachine";
import { MoveToState } from "@/state_machine/MoveToState";
import { RunActionState } from "@/state_machine/RunActionState";
import { IUnit } from "@/unit/IUnit";

describe("RunActionState class", () => {
  it("should correctly initialize", () => {
    const fsm: FiniteStateMachine = new FiniteStateMachine();
    const plan: Plan = [new GenericAction(1), new GenericAction(2)];
    const state: RunActionState = new RunActionState(fsm, plan);

    expect(state.plan).toBe(plan);
  });

  it("should correctly handle throw NotPerformableActionError if action condition fails", () => {
    const errorHandler: IErrorHandler = new SilentErrorHandler();
    const first: AbstractAction = new GenericAction(1);
    const second: AbstractAction = new GenericAction(1);
    const fsm: FiniteStateMachine = new FiniteStateMachine(errorHandler);
    const plan: Plan = [first, second];
    const state: RunActionState = new RunActionState(fsm, plan, errorHandler);

    jest.spyOn(first, "performAction").mockImplementation(() => false);
    jest.spyOn(errorHandler, "onError").mockImplementation(() => jest.fn());

    expect(state.execute({} as IUnit)).toBe(true);
    expect(errorHandler.onError).toHaveBeenCalledTimes(1);
    expect(errorHandler.onError).toHaveBeenCalledWith(new NotPerformableActionError(), "fsm_run_action_state_error");
  });

  it("should correctly handle empty plan", () => {
    const fsm: FiniteStateMachine = new FiniteStateMachine();
    const plan: Plan = [];
    const state: RunActionState = new RunActionState(fsm, plan);

    expect(state.execute({} as IUnit)).toBe(true);
  });

  it("should correctly remove all actions that are done and reset them", () => {
    const first: AbstractAction = new GenericAction(1);
    const second: AbstractAction = new GenericAction(1);
    const fsm: FiniteStateMachine = new FiniteStateMachine();
    const plan: Plan = [first, second];
    const state: RunActionState = new RunActionState(fsm, plan);

    jest.spyOn(first, "isFinished").mockImplementation(() => true);
    jest.spyOn(first, "reset").mockImplementation(() => {});
    jest.spyOn(second, "isFinished").mockImplementation(() => true);
    jest.spyOn(second, "reset").mockImplementation(() => {});

    expect(state.execute({} as IUnit)).toBe(true);
    expect(state.plan).toEqual([]);

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
    const plan: Plan = [first, second, third];
    const state: RunActionState = new RunActionState(fsm, plan);
    const unit: IUnit = {} as IUnit;

    jest.spyOn(first, "isFinished").mockImplementation(() => true);
    jest.spyOn(first, "reset").mockImplementation(() => {});

    jest.spyOn(second, "requiresInRange").mockImplementation(() => true);
    jest.spyOn(second, "isInRange").mockImplementation(() => true);

    expect(state.execute(unit)).toBe(false);
    expect(state.plan).toEqual([second, third]);

    expect(first.isFinished).toHaveBeenCalledTimes(1);
    expect(first.reset).toHaveBeenCalledTimes(1);
    expect(second.isAvailable).toHaveBeenCalledTimes(1);
    expect(second.isAvailable).toHaveBeenCalledWith(unit);
    expect(second.performAction).toHaveBeenCalledTimes(1);
    expect(second.performAction).toHaveBeenCalledWith(unit);
    expect(third.isAvailable).not.toHaveBeenCalled();
    expect(third.performAction).not.toHaveBeenCalled();

    expect(state.execute(unit)).toBe(false);
    expect(state.plan).toEqual([second, third]);
    expect(second.performAction).toHaveBeenCalledTimes(2);
    expect(third.performAction).not.toHaveBeenCalled();

    jest.spyOn(second, "isAvailable").mockImplementation(() => false);

    expect(state.execute(unit)).toBe(false);
    expect(state.plan).toEqual([second, third]);
    expect(second.performAction).toHaveBeenCalledTimes(2);
    expect(third.performAction).not.toHaveBeenCalled();
  });

  it("should correctly add react target state to FSM if needed", () => {
    const first: AbstractAction = new GenericAction(1);
    const second: AbstractAction = new GenericAction(1);
    const third: AbstractAction = new GenericAction(1);
    const fsm: FiniteStateMachine = new FiniteStateMachine();
    const plan: Plan = [first, second, third];
    const state: RunActionState = new RunActionState(fsm, plan);
    const unit: IUnit = {} as IUnit;

    fsm.stack.push(state);

    jest.spyOn(first, "isFinished").mockImplementation(() => true);
    jest.spyOn(first, "reset").mockImplementation(() => {});

    jest.spyOn(second, "requiresInRange").mockImplementation(() => true);
    jest.spyOn(second, "isInRange").mockImplementation(() => false);

    expect(state.execute(unit)).toBe(false);
    expect(state.plan).toEqual([second, third]);

    expect(first.isFinished).toHaveBeenCalledTimes(1);
    expect(first.reset).toHaveBeenCalledTimes(1);
    expect(second.isAvailable).not.toHaveBeenCalled();
    expect(second.performAction).not.toHaveBeenCalled();
    expect(third.isAvailable).not.toHaveBeenCalled();
    expect(third.performAction).not.toHaveBeenCalled();

    // Verify that move to target state is pushed.
    expect(fsm.stack).toEqual([state, new MoveToState(second)]);
  });
});
