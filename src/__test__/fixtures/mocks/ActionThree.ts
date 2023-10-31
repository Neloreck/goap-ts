import { ActionOne } from "@/__test__/fixtures/mocks/ActionOne";
import { State } from "@/state/State";
import { IUnit } from "@/unit/IUnit";

export class ActionThree<T = unknown> extends ActionOne<T> {
  public constructor(target: T) {
    super(target);

    this.addPrecondition(new State(0, "goal", false));
    this.addEffect(new State(0, "goal", true));
  }

  public override generateBaseCost(unit: IUnit): number {
    return 0;
  }
}
