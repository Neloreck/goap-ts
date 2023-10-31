import { AbstractAgent } from "@/agent/AbstractAgent";
import { GenericPlanner } from "@/planner/GenericPlanner";
import { IPlanner } from "@/planner/IPlanner";

export class DefaultAgent extends AbstractAgent {
  /**
   * @returns new planner object
   */
  protected override generatePlannerObject(): IPlanner {
    return new GenericPlanner();
  }
}
