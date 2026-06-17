import type { DataFilterItemProps } from "./data-filter-item-props";
import type { DataFilterOperator } from "../types";

export interface DataFilterOperatorSelectProps {
  item: DataFilterItemProps;
  operator: DataFilterOperator;
  value: unknown;
  onChange: (operator: DataFilterOperator, value: unknown) => void;
}
