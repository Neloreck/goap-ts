import { describe, it } from "@jest/globals";

import { Action } from "@/Action";
import { DefaultAgent } from "@/agent";
import { AnyObject, Queue } from "@/types";
import { Unit } from "@/unit/Unit";

describe("cookie GOAP planning example", () => {
  class CustomUnit extends Unit {
    public goapPlanFailed(actions: Array<Action>): void;
    public goapPlanFailed(actions: Queue<Action>): void;
    public goapPlanFailed(actions: Array<Action> | Queue<Action>): void {}

    public goapPlanFinished(): void {}

    public goapPlanFound(actions: Array<Action>): void;
    public goapPlanFound(actions: Queue<Action>): void;
    public goapPlanFound(actions: Array<Action> | Queue<Action>): void {}

    public moveTo(target: AnyObject): boolean {
      return false;
    }

    public update(): void {}
  }

  it("should correctly handle planning of defined scenario", () => {
    const customGoapUnit: CustomUnit = new CustomUnit();
    const agent = new DefaultAgent(customGoapUnit);
  });
});
