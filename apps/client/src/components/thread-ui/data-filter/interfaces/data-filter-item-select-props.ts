import type { DataFilterItemBaseProps } from "./data-filter-item-base-props";
import type { DataFilterSelectOptions } from "./data-filter-select-options";
import type { DataFilterSelectOperator } from "../types";

export interface DataFilterItemSelectProps extends DataFilterItemBaseProps<
  Array<string> | null,
  DataFilterSelectOperator
> {
  type: "select";
  options: DataFilterSelectOptions;
  placeholder?: string;
}
