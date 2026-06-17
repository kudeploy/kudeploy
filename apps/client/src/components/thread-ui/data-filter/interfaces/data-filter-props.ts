import type { DataFilterValues } from "../types";
import type { DataFilterItemProps } from "./data-filter-item-props";
import type { DataFilterSearchProps } from "./data-filter-search-props";
import type { DataFilterSortProps } from "./data-filter-sort-props";

export interface DataFilterProps {
  className?: string;
  loading?: boolean;
  filters: Array<DataFilterItemProps>;
  search?: DataFilterSearchProps;
  sort?: DataFilterSortProps;
  values?: DataFilterValues;
  onChange?: (values: DataFilterValues) => void;
}
