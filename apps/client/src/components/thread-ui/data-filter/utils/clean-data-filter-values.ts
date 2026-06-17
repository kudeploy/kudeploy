import { isEmptyDataFilterValue } from "./is-empty-data-filter-value";
import type { DataFilterValues } from "../types";

export const cleanDataFilterValues = (
  values: DataFilterValues,
): DataFilterValues => {
  return Object.fromEntries(
    Object.entries(values).filter(
      ([, value]) => !isEmptyDataFilterValue(value),
    ),
  );
};
