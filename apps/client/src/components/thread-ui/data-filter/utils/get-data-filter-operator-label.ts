import { dataFilterOperatorLabels } from "./data-filter-operator-labels";
import type { DataFilterOperator } from "../types";

export const getDataFilterOperatorLabel = (
  operator: DataFilterOperator,
): string => {
  return dataFilterOperatorLabels[operator];
};
