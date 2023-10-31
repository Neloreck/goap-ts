import { GenericAction } from "@/__test__/fixtures/mocks/GenericAction";
import { State } from "@/state/State";

export class TransitionAction<T = unknown> extends GenericAction<T> {
  public constructor(target: T) {
    super(target);

    this.addPrecondition(new State(0, "goal", false));
    this.addEffect(new State(0, "goal", true));
  }
}