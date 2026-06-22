import { describe, expect, it } from "vitest";
import dayjs from "dayjs";

import {
  formatConnectionFilterValue,
  formatFilterValues,
} from "./format-filter-values";

describe("formatFilterValues", () => {
  it("preserves operator conditions when no formatter is provided", () => {
    expect(
      formatFilterValues({
        status: {
          $in: ["ACTIVE"],
        },
      }),
    ).toEqual({
      status: {
        $in: ["ACTIVE"],
      },
    });
  });

  it("passes the selected operator to custom formatters", () => {
    expect(
      formatFilterValues(
        {
          created_at: {
            $gte: "2026-06-17T00:00:00.000Z",
          },
        },
        (field, value, operator) => ({
          field,
          value,
          operator,
        }),
      ),
    ).toEqual({
      created_at: {
        field: "created_at",
        value: "2026-06-17T00:00:00.000Z",
        operator: "$gte",
      },
    });
  });

  it("formats date upper bounds as the end of the selected day", () => {
    expect(
      formatFilterValues(
        {
          createdAt: {
            $lte: "2026-06-17T00:00:00.000Z",
          },
        },
        formatConnectionFilterValue,
      ),
    ).toEqual({
      createdAt: {
        $lte: dayjs("2026-06-17T00:00:00.000Z").endOf("day").toISOString(),
      },
    });
  });
});
