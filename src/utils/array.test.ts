import { describe, expect, it } from "@jest/globals";

import { AnyObject, Queue, Stack } from "@/types";
import { queuePeek, removeFromArray, stackPeek } from "@/utils/array";

describe("array utils module", () => {
  it("removeFromArray should correctly remove primitives", () => {
    const original: Array<number> = [1, 2, 3];
    const same: Array<number> = original;

    removeFromArray(original, 1);
    expect(original).toEqual([2, 3]);

    removeFromArray(original, 3);
    expect(original).toEqual([2]);

    removeFromArray(original, 4);
    expect(original).toEqual([2]);

    removeFromArray(original, 2);
    expect(original).toEqual([]);
    expect(same).toEqual([]);
    expect(same).toBe(original);
  });

  it("removeFromArray should correctly remove objects", () => {
    const first = { a: 1 };
    const second = { b: 2 };

    const original: Array<AnyObject> = [first, second];

    removeFromArray(original, {});
    expect(original).toEqual([first, second]);

    removeFromArray(original, { a: 1 });
    expect(original).toEqual([first, second]);

    removeFromArray(original, first);
    expect(original).toEqual([second]);

    removeFromArray(original, second);
    expect(original).toEqual([]);
  });

  it("stackPeek should correctly peek from array based stack", () => {
    const first = { a: 1 };
    const second = { b: 2 };

    const stack: Stack<AnyObject> = [first, second];

    expect(stackPeek(stack)).toBe(second);

    expect(stack.pop()).toBe(second);
    expect(stackPeek(stack)).toBe(first);

    expect(stack.pop()).toBe(first);
    expect(stackPeek(stack)).toBeNull();

    expect(stack.pop()).toBeUndefined();
    expect(stackPeek(stack)).toBeNull();
  });

  it("queuePeek should correctly peek from array based stack", () => {
    const first = { a: 1 };
    const second = { b: 2 };

    const queue: Queue<AnyObject> = [first, second];

    expect(queuePeek(queue)).toBe(first);

    expect(queue.shift()).toBe(first);
    expect(queuePeek(queue)).toBe(second);

    expect(queue.shift()).toBe(second);
    expect(queuePeek(queue)).toBeNull();

    expect(queue.shift()).toBeUndefined();
    expect(queuePeek(queue)).toBeNull();
  });
});
