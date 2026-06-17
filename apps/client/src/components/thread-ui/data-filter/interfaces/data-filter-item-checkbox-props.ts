import type { DataFilterItemBaseProps } from "./data-filter-item-base-props";
import type { DataFilterCheckboxOperator } from "../types";

export interface DataFilterItemCheckboxProps extends DataFilterItemBaseProps<
  boolean | null,
  DataFilterCheckboxOperator
> {
  type: "checkbox";
}
