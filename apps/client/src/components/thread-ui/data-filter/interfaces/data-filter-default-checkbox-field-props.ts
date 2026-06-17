import type { DataFilterItemCheckboxProps } from "./data-filter-item-checkbox-props";

export interface DataFilterDefaultCheckboxFieldProps {
  item: DataFilterItemCheckboxProps;
  value: unknown;
  onChange: (value: unknown) => void;
}
