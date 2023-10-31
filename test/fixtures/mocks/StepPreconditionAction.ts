import { GenericAction } from "#/fixtures/mocks/GenericAction";

import { State } from "@/State";
import { IUnit } from "@/unit/IUnit";

export class StepPreconditionAction<T = unknown> extends GenericAction<T> {
  public constructor(target: T) {
    super(target);

    this.addPrecondition(new State(0, "step", true));
    this.addEffect(new State(0, "goal", true));
  }

  public override generateBaseCost(unit: IUnit): number {
    return 1;
  }
}
