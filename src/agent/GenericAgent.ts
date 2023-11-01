import { AbstractAgent } from "@/agent/AbstractAgent";
import { GenericPlanner } from "@/planner/GenericPlanner";
import { IPlanner } from "@/planner/IPlanner";

export class GenericAgent extends AbstractAgent {
  /**
   * @returns new planner object
   */
  protected override createPlannerObject(): IPlanner {
    return new GenericPlanner();
  }
}
