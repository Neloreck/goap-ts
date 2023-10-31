import { IPlanCreatedEventListener } from "@/state/IPlanCreatedEventListener";
import { IFiniteStateMachinePlanEventListener } from "@/unit/IFiniteStateMachinePlanEventListener";
import { IImportantUnitChangeEventListener } from "@/unit/IImportantUnitChangeEventListener";

export interface IAgent
  extends IImportantUnitChangeEventListener,
    IPlanCreatedEventListener,
    IFiniteStateMachinePlanEventListener {}
