import { describe, expect, it, jest } from "@jest/globals";

import { GenericAction, TestUnit } from "#/fixtures/mocks";

import { AbstractAction } from "@/AbstractAction";
import { GenericPlanner } from "@/planner/GenericPlanner";
import { State } from "@/State";
import { Queue } from "@/types";
import { AbstractUnit } from "@/unit/AbstractUnit";

describe("GenericPlanner class", () => {
  const createTestUnit = () => {
    const unit: TestUnit = new TestUnit();

    unit.addWorldState(new State(0, "goal", false));
    unit.addGoalState(new State(1, "goal", true));

    return unit;
  };

  it("should correctly initialize", () => {
    expect(new GenericPlanner()).toEqual({});
  });

  it("should correctly plan without anything", () => {
    expect(new GenericPlanner().plan(createTestUnit())).toBeNull();
  });

  it("should correctly plan with connection and not possible outcome", () => {
    const unit: AbstractUnit = createTestUnit();
    const action: GenericAction = new GenericAction(1);

    unit.addAction(action);

    expect(new GenericPlanner().plan(unit)).toBeNull();
  });

  it("should correctly plan with connection and with not possible scenario", () => {
    const unit: AbstractUnit = createTestUnit();
    const action: GenericAction = new GenericAction(1);

    unit.addAction(action);

    action.addPrecondition(new State(0, "step", true));
    action.addEffect(new State(0, "goal", true));

    expect(new GenericPlanner().plan(unit)).toBeNull();
  });

  it("should correctly plan with single action to reach goal", () => {
    const unit: AbstractUnit = createTestUnit();
    const action: GenericAction = new GenericAction(1);

    action.addPrecondition(new State(0, "goal", false));
    action.addEffect(new State(0, "goal", true));

    unit.addAction(action);

    const plan: Queue<AbstractAction> = new GenericPlanner().plan(unit);

    expect(plan).not.toBeNull();
    expect(plan).toHaveLength(1);
    expect(plan).toEqual([action]);
  });

  it("should correctly plan with few actions in depth", () => {
    const unit: AbstractUnit = createTestUnit();

    const first: GenericAction = new GenericAction(1);
    const second: GenericAction = new GenericAction(1);

    unit.addWorldState(new State(0, "precondition", false));

    first.addPrecondition(new State(0, "precondition", false));
    first.addEffect(new State(0, "precondition", true));

    second.addPrecondition(new State(0, "goal", false));
    second.addPrecondition(new State(0, "precondition", true));
    second.addEffect(new State(0, "goal", true));

    unit.addAction(new GenericAction(1));
    unit.addAction(new GenericAction(1));
    unit.addAction(first);
    unit.addAction(second);
    unit.addAction(new GenericAction(1));
    unit.addAction(new GenericAction(1));

    const plan: Queue<AbstractAction> = new GenericPlanner().plan(unit);

    expect(plan).not.toBeNull();
    expect(plan).toHaveLength(2);
    expect(plan).toEqual([first, second]);
  });

  it("should correctly plan with few actions in depth and different cost", () => {
    const unit: AbstractUnit = createTestUnit();

    const firstExpensive: GenericAction = new GenericAction(1);
    const firstCheap: GenericAction = new GenericAction(1);
    const second: GenericAction = new GenericAction(1);

    unit.addWorldState(new State(0, "precondition", false));

    firstExpensive.addPrecondition(new State(0, "precondition", false));
    firstExpensive.addEffect(new State(0, "precondition", true));

    firstCheap.addPrecondition(new State(0, "precondition", false));
    firstCheap.addEffect(new State(0, "precondition", true));

    second.addPrecondition(new State(0, "goal", false));
    second.addPrecondition(new State(0, "precondition", true));
    second.addEffect(new State(0, "goal", true));

    unit.addAction(firstExpensive);
    unit.addAction(firstCheap);
    unit.addAction(second);

    jest.spyOn(firstExpensive, "generateBaseCost").mockImplementation(() => 100);
    jest.spyOn(firstCheap, "generateBaseCost").mockImplementation(() => 10);

    const plan: Queue<AbstractAction> = new GenericPlanner().plan(unit);

    expect(plan).not.toBeNull();
    expect(plan).toHaveLength(2);
    expect(plan).toEqual([firstCheap, second]);
  });

  it("should correctly plan with complex scenario", () => {
    const unit: TestUnit = new TestUnit();

    unit.addGoalState(new State(1, "warm", true));

    const getAxeAction: GenericAction = new GenericAction(1);
    const chopWoodAction: GenericAction = new GenericAction(1);
    const collectWoodAction: GenericAction = new GenericAction(1);
    const setCampfireAction: GenericAction = new GenericAction(1);

    unit.addWorldState(new State(0, "hasAxe", false));
    unit.addWorldState(new State(0, "hasWood", false));
    unit.addWorldState(new State(0, "woodChopped", false));
    unit.addWorldState(new State(0, "warm", false));

    getAxeAction.addPrecondition(new State(0, "hasAxe", false));
    getAxeAction.addEffect(new State(0, "hasAxe", true));

    chopWoodAction.addPrecondition(new State(0, "hasAxe", true));
    chopWoodAction.addEffect(new State(0, "woodChopped", true));

    collectWoodAction.addPrecondition(new State(0, "woodChopped", true));
    collectWoodAction.addEffect(new State(0, "hasWood", true));

    setCampfireAction.addPrecondition(new State(0, "hasWood", true));
    setCampfireAction.addEffect(new State(0, "hasWood", false));
    setCampfireAction.addEffect(new State(0, "warm", true));

    unit.addAction(chopWoodAction);
    unit.addAction(setCampfireAction);
    unit.addAction(collectWoodAction);
    unit.addAction(getAxeAction);

    const plan: Queue<AbstractAction> = new GenericPlanner().plan(unit);

    expect(plan).not.toBeNull();
    expect(plan).toHaveLength(4);
    expect(plan).toEqual([getAxeAction, chopWoodAction, collectWoodAction, setCampfireAction]);
  });
});
