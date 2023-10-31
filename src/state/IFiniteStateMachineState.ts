import { IUnit } from "@/unit/IUnit";

export interface IFiniteStateMachineState {
  /**
   * Returning false results in the removing of the implementers instance on the stack of the FSM.
   * True signalizes that the running actions are valid and not finished / obsolete.
   * Catches Exceptions for the FSM State to check if a plan has failed.
   *
   * @param unit - the unit which action is being run
   * @return if the action is still running (true) or is completed (false)
   *
   * @throws error
   */
  runAction(unit: IUnit): boolean;
}
