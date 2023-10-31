import { describe, it } from "@jest/globals";

import { AbstractAction } from "@/AbstractAction";
import { DefaultAgent } from "@/agent";
import { AnyObject, Queue } from "@/types";
import { Unit } from "@/unit/Unit";

describe("cookie GOAP planning example", () => {
  class CustomUnit extends Unit {
    public goapPlanFailed(actions: Array<AbstractAction>): void;
    public goapPlanFailed(actions: Queue<AbstractAction>): void;
    public goapPlanFailed(actions: Array<AbstractAction> | Queue<AbstractAction>): void {}

    public goapPlanFinished(): void {}

    public goapPlanFound(actions: Array<AbstractAction>): void;
    public goapPlanFound(actions: Queue<AbstractAction>): void;
    public goapPlanFound(actions: Array<AbstractAction> | Queue<AbstractAction>): void {}

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
