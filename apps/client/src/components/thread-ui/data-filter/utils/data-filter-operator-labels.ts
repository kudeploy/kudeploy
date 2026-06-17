import type { DataFilterOperator } from "../types";

export const dataFilterOperatorLabels: Record<DataFilterOperator, string> = {
  $eq: "is",
  $ne: "is not",
  $gt: "greater than",
  $gte: "greater than or equal",
  $lt: "less than",
  $lte: "less than or equal",
  $fulltext: "contains",
  $in: "contains",
  $nin: "does not contain",
};
