import { describe, expect, it, jest } from "@jest/globals";

import { GenericAction, TestUnit } from "#/fixtures/mocks";

import { AbstractAction } from "@/AbstractAction";
import { AbstractAgent } from "@/agent/AbstractAgent";
import { Plan } from "@/alias";
import { GenericPlanner } from "@/planner/GenericPlanner";
import { IPlanner } from "@/planner/IPlanner";
import { Property } from "@/Property";
import { FiniteStateMachine } from "@/state_machine/FiniteStateMachine";
import { IdleState } from "@/state_machine/IdleState";
import { MoveToState } from "@/state_machine/MoveToState";
import { RunActionState } from "@/state_machine/RunActionState";
import { IUnit } from "@/unit/IUnit";

describe("AbstractAgent class", () => {
  class Agent extends AbstractAgent {
    public declare readonly fsm: FiniteStateMachine;
    public declare readonly idleState: IdleState;
    public declare readonly unit: IUnit;

    protected override createPlannerObject(): IPlanner {
      return new GenericPlanner();
    }
  }

  it("should correctly initialize", () => {
    const unit: TestUnit = new TestUnit();
    const agent: Agent = new Agent(unit);

    expect(agent.getUnit()).toBe(unit);

    expect(agent.idleState.getListeners()).toEqual([agent]);
    expect(agent.fsm.getListeners()).toEqual([agent]);
    expect((agent.unit as TestUnit).getListeners()).toEqual([agent]);
  });

  it("should correctly create planner", () => {
    const unit: TestUnit = new TestUnit();
    const agent: Agent = new Agent(unit);

    expect(agent.idleState["planner"]).toBeInstanceOf(GenericPlanner);
  });

  it("should correctly handle initial update with empty FSM", () => {
    const unit: TestUnit = new TestUnit();
    const agent: Agent = new Agent(unit);

    jest.spyOn(unit, "update").mockImplementation(jest.fn());
    jest.spyOn(agent.fsm, "update").mockImplementation(jest.fn());

    agent.update();

    expect(agent.fsm.getStack()).toEqual([agent.idleState]);
    expect(agent.unit.update).toHaveBeenCalledTimes(1);
    expect(agent.fsm.update).toHaveBeenCalledTimes(1);
    expect(agent.fsm.update).toHaveBeenCalledWith(unit);

    agent.update();

    expect(agent.fsm.getStack()).toEqual([agent.idleState]);
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
    expect(agent.fsm.getStack()).toEqual([agent.idleState]);
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
    expect(agent.fsm.getStack()).toEqual([agent.idleState]);
  });

  it("should correctly handle plan creation", () => {
    const unit: TestUnit = new TestUnit();
    const agent: Agent = new Agent(unit);
    const state: MoveToState = new MoveToState(new GenericAction(55));
    const plan: Plan = [new GenericAction(1), new GenericAction(2)];

    agent.fsm.push(state);
    agent.fsm.push(agent.idleState);

    expect(agent.fsm.getStack()).toEqual([state, agent.idleState]);

    agent.onPlanCreated(plan);

    expect(unit.onGoapPlanFound).toHaveBeenCalledWith(plan);
    expect(agent.fsm.getStack()).toEqual([state, new RunActionState(agent.fsm, plan)]);
  });

  it("should correctly handle plan failure", () => {
    const unit: TestUnit = new TestUnit();
    const agent: Agent = new Agent(unit);
    const plan: Plan = [new GenericAction(1), new GenericAction(2)];

    agent.fsm.push(agent.idleState);

    agent.onPlanFailed(plan);

    expect(unit.onGoapPlanFailed).toHaveBeenCalledWith(plan);
    expect(agent.fsm.getStack()).toEqual([agent.idleState]);
  });

  it("should correctly handle plan finish", () => {
    const unit: TestUnit = new TestUnit();
    const agent: Agent = new Agent(unit);

    agent.fsm.push(agent.idleState);

    agent.onPlanFinished();

    expect(unit.onGoapPlanFinished).toHaveBeenCalledTimes(1);
    expect(agent.fsm.getStack()).toEqual([agent.idleState]);
  });
});
