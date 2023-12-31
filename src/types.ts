/**
 * Generic optional object.
 */
export type Optional<T> = T | null;

/**
 * Generic definable object.
 */
export type Definable<T> = T | undefined;

/**
 * Generic maybe object.
 */
export type Maybe<T> = T | null | undefined;

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

/**
 * Generic optional object.
 */
export type PropertyId = string | number | symbol;
