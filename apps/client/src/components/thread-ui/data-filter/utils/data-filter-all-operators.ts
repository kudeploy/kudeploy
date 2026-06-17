import type { DataFilterOperator } from "../types";

export const dataFilterAllOperators: Array<DataFilterOperator> = [
  "$eq",
  "$ne",
  "$gt",
  "$gte",
  "$lt",
  "$lte",
  "$fulltext",
  "$in",
  "$nin",
];
