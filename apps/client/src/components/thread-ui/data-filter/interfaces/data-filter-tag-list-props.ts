import type { DataFilterValues } from "../types";
import type { DataFilterItemProps } from "./data-filter-item-props";

export interface DataFilterTagListProps {
  filters: Array<DataFilterItemProps>;
  values?: DataFilterValues;
  onChange?: (values: DataFilterValues) => void;
}
