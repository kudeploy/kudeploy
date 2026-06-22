import { describe, expect, it } from "vitest";

import { formatVolumeFilterValue } from "./volume-filter";

describe("formatVolumeFilterValue", () => {
  it("uses equality for the name filter", () => {
    expect(formatVolumeFilterValue("name", "data")).toEqual({ $eq: "data" });
  });

  it("passes through unrelated filter values", () => {
    expect(
      formatVolumeFilterValue("createdAt", { $gte: "2026-06-01" }),
    ).toEqual({ $gte: "2026-06-01" });
  });

  it("preserves operators for unrelated filter fields", () => {
    expect(formatVolumeFilterValue("createdAt", "2026-06-01", "$gte")).toEqual({
      $gte: "2026-06-01",
    });
  });
});
