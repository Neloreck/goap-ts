import { describe, expect, it, jest } from "@jest/globals";

import { GenericAction, TestUnit } from "#/fixtures/mocks";

import { AbstractAction } from "@/AbstractAction";
import { GenericPlanner } from "@/planner";
import { Property } from "@/Property";

describe("shooting scenario", () => {
  const pickAmmo: AbstractAction = new GenericAction("pick_ammo");
  const pickJunk: AbstractAction = new GenericAction("pick_junk");
  const reload: AbstractAction = new GenericAction("reload_weapon");
  const pickWeapon: AbstractAction = new GenericAction("pick_weapon");
  const startShooting: AbstractAction = new GenericAction("start_shooting");

  jest.spyOn(pickWeapon, "generateCost").mockImplementation(() => 10);
  jest.spyOn(pickJunk, "generateCost").mockImplementation(() => 5);
  jest.spyOn(pickAmmo, "generateCost").mockImplementation(() => 8);
  jest.spyOn(startShooting, "generateCost").mockImplementation(() => 2);
  jest.spyOn(reload, "generateCost").mockImplementation(() => 3);

  pickWeapon
    .addPrecondition(new Property("can_pick_weapon", true))
    .addPrecondition(new Property("has_weapon", false))
    .addEffect(new Property("has_weapon", true));

  pickAmmo
    .addPrecondition(new Property("has_ammo", false))
    .addPrecondition(new Property("has_weapon", true))
    .addEffect(new Property("has_ammo", true));

  reload
    .addPrecondition(new Property("is_reloaded", false))
    .addPrecondition(new Property("has_weapon", true))
    .addPrecondition(new Property("has_ammo", true))
    .addEffect(new Property("is_reloaded", true));

  startShooting
    .addPrecondition(new Property("is_reloaded", true))
    .addPrecondition(new Property("has_weapon", true))
    .addPrecondition(new Property("has_ammo", true))
    .addEffect(new Property("end", true));

  pickJunk.addPrecondition(new Property("has_junk", false)).addEffect(new Property("has_junk", true));

  it("should correctly plan order of actions", () => {
    const unit: TestUnit = new TestUnit();

    unit.addWorldState(new Property("end", false));
    unit.addWorldState(new Property("can_pick_weapon", true));
    unit.addWorldState(new Property("has_ammo", false));
    unit.addWorldState(new Property("has_junk", false));
    unit.addWorldState(new Property("has_weapon", false));
    unit.addWorldState(new Property("is_reloaded", false));

    unit.addGoalState(new Property("end", true, 500));
    unit.addGoalState(new Property("has_junk", true, 100));

    unit.addAction(pickAmmo).addAction(pickJunk).addAction(pickWeapon).addAction(startShooting).addAction(reload);

    const planner: GenericPlanner = new GenericPlanner();

    expect(planner.plan(unit)?.map((it) => it.target)).toEqual([
      "pick_weapon",
      "pick_ammo",
      "reload_weapon",
      "start_shooting",
    ]);

    unit.addWorldState(new Property("end", false));

    expect(planner.plan(unit)?.map((it) => it.target)).toEqual([
      "pick_weapon",
      "pick_ammo",
      "reload_weapon",
      "start_shooting",
    ]);

    unit.addWorldState(new Property("end", true));

    expect(planner.plan(unit)?.map((it) => it.target)).toEqual(["pick_junk"]);

    unit.addWorldState(new Property("end", false));
    unit.addWorldState(new Property("has_junk", false));
    unit.addWorldState(new Property("can_pick_weapon", false));

    expect(planner.plan(unit)?.map((it) => it.target)).toEqual(["pick_junk"]);

    unit.addWorldState(new Property("has_junk", true));

    expect(planner.plan(unit)).toBeNull();

    unit.addWorldState(new Property("can_pick_weapon", true));
    unit.addWorldState(new Property("has_weapon", true));

    expect(planner.plan(unit)?.map((it) => it.target)).toEqual(["pick_ammo", "reload_weapon", "start_shooting"]);

    unit.addWorldState(new Property("is_reloaded", true));

    expect(planner.plan(unit)?.map((it) => it.target)).toEqual(["pick_ammo", "start_shooting"]);

    unit.addWorldState(new Property("has_ammo", true));

    expect(planner.plan(unit)?.map((it) => it.target)).toEqual(["start_shooting"]);

    unit.addWorldState(new Property("end", true));
    unit.addWorldState(new Property("has_junk", true));

    expect(planner.plan(unit)?.map((it) => it.target)).toEqual(["start_shooting"]);
  });
});
