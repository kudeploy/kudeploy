import {
  DataFilterSearch,
  DataFilterSort,
  DataFilterTagList,
} from "./components";
import type { FC } from "react";
import type { DataFilterProps } from "./interfaces";
import { cn } from "@/lib/utils";

export const DataFilter: FC<DataFilterProps> = ({
  className,
  loading,
  filters,
  search,
  sort,
  values,
  onChange,
}) => {
  return (
    <div
      data-slot="data-filter"
      className={cn(
        "grid grid-cols-1 items-center gap-2 has-[>[data-slot=data-filter-sort]]:grid-cols-[minmax(0,1fr)_auto]",
        "*:data-[slot=data-filter-search]:min-w-0",
        "*:data-[slot=data-filter-sort]:justify-self-end",
        "*:data-[slot=data-filter-tag-list]:col-span-full",
        className,
      )}
    >
      <DataFilterSearch {...search} loading={loading ?? search?.loading} />

      {sort && sort.options.length > 0 && <DataFilterSort {...sort} />}

      {filters.length > 0 && (
        <DataFilterTagList
          filters={filters}
          values={values}
          onChange={onChange}
        />
      )}
    </div>
  );
};
