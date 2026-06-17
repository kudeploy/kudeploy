import { getDataFilterCondition } from "./get-data-filter-condition";
import { isEmpty } from "./is-empty";

export const isEmptyDataFilterValue = (value: unknown): boolean => {
  return isEmpty(getDataFilterCondition(value).value);
};
