import { describe, expect, it, jest } from "@jest/globals";

import { GenericAction, TestUnit } from "#/fixtures/mocks";

import { AbstractAction } from "@/AbstractAction";
import { AbstractAgent } from "@/agent/AbstractAgent";
import { Plan } from "@/alias";
import { IErrorHandler, SilentErrorHandler } from "@/error";
import { GenericPlanner } from "@/planner/GenericPlanner";
import { IPlanner } from "@/planner/IPlanner";
import { Property } from "@/property/Property";
import { FiniteStateMachine } from "@/state_machine/FiniteStateMachine";
import { IdleState } from "@/state_machine/IdleState";
import { MoveToState } from "@/state_machine/MoveToState";
import { RunActionState } from "@/state_machine/RunActionState";
import { IUnit } from "@/unit/IUnit";

describe("AbstractAgent class", () => {
  class Agent extends AbstractAgent {
    public declare readonly fsm: FiniteStateMachine;
    public declare readonly idle: IdleState;
    public declare readonly unit: IUnit;
    public declare readonly errorHandler: IErrorHandler;

    protected override createPlannerObject(): IPlanner {
      return new GenericPlanner(this.errorHandler);
    }
  }

  it("should correctly initialize", () => {
    const unit: TestUnit = new TestUnit();
    const agent: Agent = new Agent(unit);

    expect(agent.getUnit()).toBe(unit);

    expect(agent.idle.getListeners()).toEqual([agent]);
    expect(agent.fsm.getListeners()).toEqual([agent]);
    expect((agent.unit as TestUnit).getListeners()).toEqual([agent]);
  });

  it("should correctly create planner", () => {
    const unit: TestUnit = new TestUnit();
    const agent: Agent = new Agent(unit);

    expect(agent.idle["planner"]).toBeInstanceOf(GenericPlanner);
    expect(agent.fsm["errorHandler"]).toBeInstanceOf(SilentErrorHandler);
    expect(agent.fsm["errorHandler"]).toBe(agent.errorHandler);
    expect(agent.errorHandler).toBeInstanceOf(SilentErrorHandler);
    expect((agent.idle["planner"] as GenericPlanner)["errorHandler"]).toBeInstanceOf(SilentErrorHandler);
    expect((agent.idle["planner"] as GenericPlanner)["errorHandler"]).toBe(agent.errorHandler);
  });

  it("should correctly handle initial update with empty FSM", () => {
    const unit: TestUnit = new TestUnit();
    const agent: Agent = new Agent(unit);

    jest.spyOn(unit, "update").mockImplementation(jest.fn());
    jest.spyOn(agent.fsm, "update").mockImplementation(jest.fn());

    agent.update();

    expect(agent.fsm.getStack()).toEqual([agent.idle]);
    expect(agent.unit.update).toHaveBeenCalledTimes(1);
    expect(agent.fsm.update).toHaveBeenCalledTimes(1);
    expect(agent.fsm.update).toHaveBeenCalledWith(unit);

    agent.update();

    expect(agent.fsm.getStack()).toEqual([agent.idle]);
    expect(agent.unit.update).toHaveBeenCalledTimes(2);
    expect(agent.fsm.update).toHaveBeenCalledTimes(2);
  });

  it("should correctly handle initial update with filled fsm", () => {
    const unit: TestUnit = new TestUnit();
    const agent: Agent = new Agent(unit);
    const state: MoveToState = new MoveToState(new GenericAction(55));

    agent.fsm.push(state);

    jest.spyOn(unit, "update").mockImplementation(jest.fn());
    jest.spyOn(agent.fsm, "update").mockImplementation(jest.fn());

    agent.update();

    expect(agent.fsm.getStack()).toEqual([state]);
    expect(agent.unit.update).toHaveBeenCalledTimes(1);
    expect(agent.fsm.update).toHaveBeenCalledTimes(1);
    expect(agent.fsm.update).toHaveBeenCalledWith(unit);
  });

  it("should correctly handle important goal change", () => {
    const unit: TestUnit = new TestUnit();
    const agent: Agent = new Agent(unit);
    const property: Property = new Property("test", true);

    agent.onImportantUnitGoalChange(property);

    expect(property.importance).toBe(Infinity);
    expect(agent.fsm.getStack()).toEqual([agent.idle]);
  });

  it("should correctly handle important goal stack reset", () => {
    const first: AbstractAction = new GenericAction(1);
    const second: AbstractAction = new GenericAction(2);

    const unit: TestUnit = new TestUnit();
    const agent: Agent = new Agent(unit);
    const state: MoveToState = new MoveToState(new GenericAction(55));

    agent.fsm.push(state);

    unit.addAction(first);
    unit.addAction(second);

    expect(agent.fsm.getStack()).toEqual([state]);

    agent.onImportantUnitStackReset();

    expect(first.reset).toHaveBeenCalled();
    expect(second.reset).toHaveBeenCalled();
    expect(agent.fsm.getStack()).toEqual([agent.idle]);
  });

  it("should correctly handle plan creation", () => {
    const unit: TestUnit = new TestUnit();
    const agent: Agent = new Agent(unit);
    const state: MoveToState = new MoveToState(new GenericAction(55));
    const plan: Plan = [new GenericAction(1), new GenericAction(2)];

    agent.fsm.push(state);
    agent.fsm.push(agent.idle);

    expect(agent.fsm.getStack()).toEqual([state, agent.idle]);

    agent.onPlanCreated(plan);

    expect(unit.onGoapPlanFound).toHaveBeenCalledWith(plan);
    expect(agent.fsm.getStack()).toEqual([state, new RunActionState(agent.fsm, plan)]);
  });

  it("should correctly handle plan failure", () => {
    const unit: TestUnit = new TestUnit();
    const agent: Agent = new Agent(unit);
    const plan: Plan = [new GenericAction(1), new GenericAction(2)];

    agent.fsm.push(agent.idle);

    agent.onPlanFailed(plan);

    expect(unit.onGoapPlanFailed).toHaveBeenCalledWith(plan);
    expect(agent.fsm.getStack()).toEqual([agent.idle]);
  });

  it("should correctly handle plan finish", () => {
    const unit: TestUnit = new TestUnit();
    const agent: Agent = new Agent(unit);

    agent.fsm.push(agent.idle);

    agent.onPlanFinished();

    expect(unit.onGoapPlanFinished).toHaveBeenCalledTimes(1);
    expect(agent.fsm.getStack()).toEqual([agent.idle]);
  });
});
