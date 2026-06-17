import type { DataFilterItemBaseProps } from "./data-filter-item-base-props";
import type { DataFilterDatePickerOperator } from "../types";

export interface DataFilterItemDatePickerProps extends DataFilterItemBaseProps<
  Date | string | null,
  DataFilterDatePickerOperator
> {
  type: "date-picker";
  min?: Date | string;
  max?: Date | string;
  placeholder?: string;
}
