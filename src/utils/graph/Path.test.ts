import { describe, expect, it } from "@jest/globals";

import { createBasicTestPath } from "@/__test__/fixtures/utils";
import { Edge } from "@/utils/graph/Edge";
import { Path } from "@/utils/graph/Path";

describe("Path class", () => {
  it("should be correctly created", () => {
    const path: Path<number, Edge> = createBasicTestPath(5, 3);

    expect(path.getVertexList()).toHaveLength(4);
    expect(path.getEdgeList()).toHaveLength(3);

    expect(path.getStartVertex()).toBe(0);
    expect(path.getEndVertex()).toBe(3);
    expect(path.getVertexList()).toEqual([0, 1, 2, 3]);
    expect(path.getEdgeList()).toEqual([new Edge(), new Edge(), new Edge()]);
  });
});
