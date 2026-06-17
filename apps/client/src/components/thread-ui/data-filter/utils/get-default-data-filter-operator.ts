import { getDataFilterOperators } from "./get-data-filter-operators";
import type { DataFilterItemProps } from "../interfaces";
import type { DataFilterOperator } from "../types";

export const getDefaultDataFilterOperator = (
  item: DataFilterItemProps,
): DataFilterOperator => {
  return item.defaultOperator ?? getDataFilterOperators(item)[0] ?? "$eq";
};
