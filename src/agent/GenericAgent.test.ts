import { describe, expect, it } from "@jest/globals";

import { TestUnit } from "#/fixtures/mocks";

import { GenericAgent } from "@/agent/GenericAgent";
import { GenericPlanner } from "@/planner/GenericPlanner";

describe("GenericAgent class", () => {
  it("should correctly initialize and create planner", () => {
    const unit: TestUnit = new TestUnit();
    const agent: GenericAgent = new GenericAgent(unit);

    expect(agent["idle"]["planner"]).toBeInstanceOf(GenericPlanner);
  });
});
