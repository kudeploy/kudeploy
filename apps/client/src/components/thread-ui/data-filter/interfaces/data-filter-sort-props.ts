import type { DataFilterSortOptions } from "./data-filter-sort-options";
import type { DataFilterSortValue } from "./data-filter-sort-value";

export interface DataFilterSortProps {
  options: Array<DataFilterSortOptions>;
  selected?: DataFilterSortValue;
  onChange?: (selected: DataFilterSortValue) => void;
}
