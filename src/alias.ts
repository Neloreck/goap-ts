import { AbstractAction } from "@/AbstractAction";
import { Property } from "@/Property";
import { Queue } from "@/types";

/**
 * List of properties.
 */
export type Properties = Array<Property>;

/**
 * Generic actions plan queue.
 */
export type Plan = Queue<AbstractAction>;
