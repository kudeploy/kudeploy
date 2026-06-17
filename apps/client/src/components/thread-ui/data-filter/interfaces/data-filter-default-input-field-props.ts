import type { DataFilterItemInputProps } from "./data-filter-item-input-props";

export interface DataFilterDefaultInputFieldProps {
  item: DataFilterItemInputProps;
  value: unknown;
  onChange: (value: unknown) => void;
}
