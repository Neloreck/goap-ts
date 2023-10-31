import { AbstractAction } from "@/AbstractAction";
import { Queue } from "@/types";

export interface IPlanCreatedEventListener {
  /**
   * This event is needed to push real action queues on the FSM-Stack.
   * Has to pop the FSM-Stack, since the event fires before the return value of the state gets checked.
   *
   * @param plan - the plan that the planner has created and is ready to be executed
   */
  onPlanCreated(plan: Queue<AbstractAction>): void;
}
