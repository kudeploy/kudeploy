import type { DataFilterConditionValue, DataFilterOperator } from "../types";

export const createDataFilterCondition = (
  operator: DataFilterOperator,
  value: unknown,
): DataFilterConditionValue => {
  return {
    [operator]: value,
  };
};
