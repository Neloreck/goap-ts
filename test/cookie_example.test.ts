import { describe, it } from "@jest/globals";

import { AbstractAction } from "@/AbstractAction";
import { GenericAgent } from "@/agent";
import { AnyObject, Queue } from "@/types";
import { AbstractUnit } from "@/unit/AbstractUnit";

describe("cookie GOAP planning example", () => {
  class CustomUnit extends AbstractUnit {
    public onGoapPlanFailed(actions: Array<AbstractAction>): void;
    public onGoapPlanFailed(actions: Queue<AbstractAction>): void;
    public onGoapPlanFailed(actions: Array<AbstractAction> | Queue<AbstractAction>): void {}

    public onGoapPlanFinished(): void {}

    public onGoapPlanFound(actions: Array<AbstractAction>): void;
    public onGoapPlanFound(actions: Queue<AbstractAction>): void;
    public onGoapPlanFound(actions: Array<AbstractAction> | Queue<AbstractAction>): void {}

    public onMoveToTarget(target: AnyObject): boolean {
      return false;
    }

    public update(): void {}
  }

  it("should correctly handle planning of defined scenario", () => {
    const customGoapUnit: CustomUnit = new CustomUnit();
    const agent = new GenericAgent(customGoapUnit);
  });
});
