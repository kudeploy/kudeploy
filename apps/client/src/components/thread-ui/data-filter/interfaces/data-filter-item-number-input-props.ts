import type { DataFilterItemBaseProps } from "./data-filter-item-base-props";
import type { DataFilterNumberInputOperator } from "../types";

export interface DataFilterItemNumberInputProps extends DataFilterItemBaseProps<
  number | null,
  DataFilterNumberInputOperator
> {
  type: "number-input";
  min?: number;
  max?: number;
  step?: number;
  decimalScale?: number;
  fixedDecimalScale?: boolean;
  placeholder?: string;
}
