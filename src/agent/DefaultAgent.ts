import { AbstractAgent } from "@/agent/AbstractAgent";
import { DefaultPlanner } from "@/planner/DefaultPlanner";
import { IPlanner } from "@/planner/IPlanner";

export class DefaultAgent extends AbstractAgent {
  /**
   * @returns new planner object
   */
  protected override generatePlannerObject(): IPlanner {
    return new DefaultPlanner();
  }
}
