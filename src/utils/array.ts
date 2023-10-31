import { Optional, Queue, Stack } from "@/types";

/**
 * @param array - target array to remove element from
 * @param element - target element to remove
 * @returns whether element was removed
 */
export function removeFromArray<T>(array: Array<T>, element: T): boolean {
  const index: number = array.indexOf(element);

  if (index === -1) {
    return false;
  } else {
    array.splice(index, 1);

    return true;
  }
}

/**
 * @param stack - target stack to get peek element from
 * @returns last stack element or null
 */
export function stackPeek<T>(stack: Stack<T>): Optional<T> {
  return stack.length === 0 ? null : stack[stack.length - 1];
}

/**
 * @param queue - target queue to get peek element from
 * @returns first queue element or null
 */
export function queuePeek<T>(queue: Queue<T>): Optional<T> {
  return queue.length === 0 ? null : queue[0];
}
