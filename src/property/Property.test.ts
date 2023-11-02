import { describe, expect, it } from "@jest/globals";

import { Property } from "@/property/Property";

describe("Property class", () => {
  it("should correctly initialize", () => {
    const property: Property = new Property("dd", 15, 10);

    expect(property).toEqual({
      importance: 10,
      id: "dd",
      value: 15,
    });
  });
});
