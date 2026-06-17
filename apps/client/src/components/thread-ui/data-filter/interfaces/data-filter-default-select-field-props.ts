import type { DataFilterItemSelectProps } from "./data-filter-item-select-props";

export interface DataFilterDefaultSelectFieldProps {
  item: DataFilterItemSelectProps;
  value: unknown;
  onChange: (value: unknown) => void;
}
