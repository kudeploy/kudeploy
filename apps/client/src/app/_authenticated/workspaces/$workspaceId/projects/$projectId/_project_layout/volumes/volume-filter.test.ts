import { describe, expect, it } from "vitest";

import { formatVolumeFilterValue } from "./volume-filter";

describe("formatVolumeFilterValue", () => {
  it("uses equality for the pinned name filter", () => {
    expect(formatVolumeFilterValue("name", "data")).toEqual({ $eq: "data" });
  });

  it("passes through unrelated filter values", () => {
    expect(formatVolumeFilterValue("createdAt", { $gte: "2026-06-01" })).toEqual(
      { $gte: "2026-06-01" },
    );
  });
});
