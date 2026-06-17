import { isDataFilterOperator } from "./is-data-filter-operator";
import type { DataFilterOperator } from "../types";

export const getDataFilterCondition = (
  value: unknown,
): { operator?: DataFilterOperator; value: unknown } => {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  ) {
    const entry = Object.entries(value as Record<string, unknown>).find(
      ([operator]) => isDataFilterOperator(operator),
    );

    if (entry) {
      return {
        operator: entry[0] as DataFilterOperator,
        value: entry[1],
      };
    }
  }

  return {
    value,
  };
};
