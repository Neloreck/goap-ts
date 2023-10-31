import { IFiniteStateMachinePlanEventListener } from "@/event/IFiniteStateMachinePlanEventListener";
import { IImportantUnitChangeEventListener } from "@/event/IImportantUnitChangeEventListener";
import { IPlanCreatedEventListener } from "@/event/IPlanCreatedEventListener";

export interface IAgent
  extends IImportantUnitChangeEventListener,
    IPlanCreatedEventListener,
    IFiniteStateMachinePlanEventListener {}
