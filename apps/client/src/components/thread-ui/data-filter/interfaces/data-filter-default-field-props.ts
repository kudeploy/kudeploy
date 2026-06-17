import type { DataFilterItemProps } from "./data-filter-item-props";
import type { DataFilterOperator } from "../types";

export interface DataFilterDefaultFieldProps {
  item: DataFilterItemProps;
  operator: DataFilterOperator;
  value: unknown;
  onChange: (value: unknown) => void;
}
