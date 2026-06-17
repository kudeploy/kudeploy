import type { DataFilterItemDatePickerProps } from "./data-filter-item-date-picker-props";

export interface DataFilterDefaultDatePickerFieldProps {
  item: DataFilterItemDatePickerProps;
  value: unknown;
  onChange: (value: unknown) => void;
}
