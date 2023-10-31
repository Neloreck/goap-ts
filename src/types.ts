/**
 * Generic optional object.
 */
export type Optional<T> = T | null;

/**
 * Any object from JS record variant.
 */
export type AnyObject = Record<string, any>;

/**
 * Any object from JS record variant.
 */
export type Queue<T> = Omit<Array<T>, "pop" | "unshift">;

/**
 * Any object from JS record variant.
 */
export type Stack<T> = Omit<Array<T>, "shift" | "unshift">;
