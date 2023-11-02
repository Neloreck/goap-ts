import { AbstractAction } from "@/AbstractAction";
import { IProperty } from "@/property";
import { Queue } from "@/types";

/**
 * List of properties.
 */
export type Properties = Array<IProperty>;

/**
 * Generic actions plan queue.
 */
export type Plan = Queue<AbstractAction>;
