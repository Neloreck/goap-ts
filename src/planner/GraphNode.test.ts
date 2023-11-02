import { describe, expect, it } from "@jest/globals";

import { GenericAction } from "#/fixtures/mocks";

import { AbstractAction } from "@/AbstractAction";
import { Properties } from "@/alias";
import { DirectedWeightedGraph, IWeightedEdge } from "@/graph";
import { IWeightedPath } from "@/graph/IWeightedPath";
import { GraphNode } from "@/planner/GraphNode";
import { Property } from "@/Property";
import { createWeightedPath } from "@/utils/path";
import { addNodeToGraphPathEnd } from "@/utils/planner";

describe("GraphNode class", () => {
  it("should correctly initialize with minimalistic data", () => {
    const node: GraphNode = new GraphNode([], []);

    expect(node.preconditions).toEqual([]);
    expect(node.effects).toEqual([]);
    expect(node.action).toBeNull();
  });

  it("should correctly initialize with complex data", () => {
    const preconditions: Properties = [new Property(1, true), new Property(2, false)];
    const effects: Properties = [new Property(1, false), new Property(3, true)];
    const action: AbstractAction = new GenericAction(1000);

    const node: GraphNode = new GraphNode(preconditions, effects, action);

    expect(node.preconditions).toBe(preconditions);
    expect(node.effects).toBe(effects);
    expect(node.action).toBe(action);
  });

  it("should correctly copy from", () => {
    const preconditions: Properties = [new Property(1, true), new Property(2, false)];
    const effects: Properties = [new Property(1, false), new Property(3, true)];
    const action: AbstractAction = new GenericAction(1000);

    const base: GraphNode = new GraphNode([], []);

    expect(base.preconditions).toEqual([]);
    expect(base.effects).toEqual([]);
    expect(base.action).toBeNull();

    base.apply(preconditions, effects, action);

    expect(base.preconditions).toBe(preconditions);
    expect(base.effects).toBe(effects);
    expect(base.action).toBe(action);
  });

  it("should correctly add paths", () => {
    const weapon: GraphNode = new GraphNode(
      [new Property("has_weapon", false)],
      [new Property("has_weapon", true)],
      new GenericAction("get_weapon")
    );
    const ammo: GraphNode = new GraphNode(
      [new Property("has_ammo", false)],
      [new Property("has_ammo", true)],
      new GenericAction("get_ammo")
    );
    const shoot: GraphNode = new GraphNode(
      [new Property("has_ammo", true), new Property("has_weapon", true)],
      [new Property("is_shooting", true)],
      new GenericAction("shoot")
    );
    const goal: GraphNode = new GraphNode([new Property("is_shooting", true)], [new Property("end", true)]);

    const graph: DirectedWeightedGraph<GraphNode> = new DirectedWeightedGraph([weapon, ammo, shoot, goal]);

    const weaponToAmmo: IWeightedEdge = { weight: 10 };
    const ammoToWeapon: IWeightedEdge = { weight: 16 };
    const ammoToShoot: IWeightedEdge = { weight: 12 };
    const shootToGoal: IWeightedEdge = { weight: 14 };

    graph
      .addEdge(weapon, ammo, weaponToAmmo)
      .addEdge(ammo, weapon, ammoToWeapon)
      .addEdge(ammo, shoot, ammoToShoot)
      .addEdge(shoot, goal, shootToGoal);

    const pickWeaponPath: IWeightedPath<GraphNode> = createWeightedPath(
      graph,
      weapon,
      weapon,
      [weapon],
      []
    ) as IWeightedPath<GraphNode>;
    const pickAmmoPath: IWeightedPath<GraphNode> = addNodeToGraphPathEnd(
      graph,
      pickWeaponPath,
      ammo
    ) as IWeightedPath<GraphNode>;
    const startShootingPath: IWeightedPath<GraphNode> = addNodeToGraphPathEnd(
      graph,
      pickAmmoPath,
      shoot
    ) as IWeightedPath<GraphNode>;
    const endGoalPath: IWeightedPath<GraphNode> = addNodeToGraphPathEnd(
      graph,
      startShootingPath,
      goal
    ) as IWeightedPath<GraphNode>;

    expect(pickWeaponPath).not.toBeNull();
    expect(pickAmmoPath).not.toBeNull();
    expect(startShootingPath).not.toBeNull();
    expect(endGoalPath).not.toBeNull();

    weapon.addGraphPath(null, pickWeaponPath);
    ammo.addGraphPath(pickWeaponPath, pickAmmoPath);
    shoot.addGraphPath(pickAmmoPath, startShootingPath);
    goal.addGraphPath(startShootingPath, endGoalPath);

    expect(weapon.states.get(pickWeaponPath)).toEqual([
      {
        id: "has_weapon",
        importance: 0,
        value: true,
      },
    ]);

    expect(ammo.states.get(pickWeaponPath)).toBeUndefined();
    expect(ammo.states.get(pickAmmoPath)).toEqual([
      {
        id: "has_weapon",
        importance: 0,
        value: true,
      },
      {
        id: "has_ammo",
        importance: 0,
        value: true,
      },
    ]);

    expect(shoot.states.get(startShootingPath)).toEqual([
      {
        id: "has_weapon",
        importance: 0,
        value: true,
      },
      {
        id: "has_ammo",
        importance: 0,
        value: true,
      },
      {
        id: "is_shooting",
        importance: 0,
        value: true,
      },
    ]);

    expect(goal.states.get(pickAmmoPath)).toBeUndefined();
    expect(goal.states.get(pickWeaponPath)).toBeUndefined();
    expect(goal.states.get(startShootingPath)).toBeUndefined();
    expect(goal.states.get(endGoalPath)).toBeUndefined();
  });
});
