import { Plus } from "lucide-react";
import { useCallback, useState } from "react";

import { cleanDataFilterValues, isEmptyDataFilterValue } from "../utils";
import { DataFilterTagItem } from "./data-filter-tag-item";
import type { DataFilterTagListProps } from "../interfaces/data-filter-tag-list-props";
import type { FC } from "react";
import type { DataFilterValues } from "../types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const DataFilterTagList: FC<DataFilterTagListProps> = ({
  filters,
  values,
  onChange,
}) => {
  const [filterValues, setFilterValues] = useState<DataFilterValues>(
    values || {},
  );
  const [{ visibleFilters, hiddenFilters }, setFilterGroups] = useState(() => {
    const initialValues = values || {};

    return {
      visibleFilters: filters.filter(
        (item) => !isEmptyDataFilterValue(initialValues[item.field]),
      ),
      hiddenFilters: filters.filter((item) =>
        isEmptyDataFilterValue(initialValues[item.field]),
      ),
    };
  });
  const [prevValues, setPrevValues] = useState(values);

  if (values !== prevValues) {
    const nextValues = values || {};

    setPrevValues(values);
    setFilterValues(nextValues);

    setFilterGroups((prev) => {
      let changed = false;
      const nextVisibleFilters = [...prev.visibleFilters];
      const nextHiddenFilters: typeof prev.hiddenFilters = [];

      for (const item of prev.hiddenFilters) {
        if (!isEmptyDataFilterValue(nextValues[item.field])) {
          nextVisibleFilters.push(item);
          changed = true;
        } else {
          nextHiddenFilters.push(item);
        }
      }

      if (!changed) {
        return prev;
      }

      return {
        visibleFilters: nextVisibleFilters,
        hiddenFilters: nextHiddenFilters,
      };
    });
  }

  const emitFiltersChange = useCallback(
    (nextValues: DataFilterValues) => {
      onChange?.(cleanDataFilterValues(nextValues));
    },
    [onChange],
  );

  const setFilterValue = useCallback(
    (field: string, value: unknown) => {
      const nextValues = {
        ...filterValues,
        [field]: value,
      };

      setFilterValues(nextValues);
      emitFiltersChange(nextValues);
    },
    [emitFiltersChange, filterValues],
  );

  const setFilterVisible = useCallback((field: string, visible: boolean) => {
    setFilterGroups((prev) => {
      return {
        ...prev,
        visibleFilters: visible
          ? [
              ...prev.visibleFilters,
              ...prev.hiddenFilters.filter((item) => item.field === field),
            ]
          : prev.visibleFilters.filter((item) => item.field !== field),
        hiddenFilters: visible
          ? prev.hiddenFilters.filter((item) => item.field !== field)
          : [
              ...prev.hiddenFilters,
              ...prev.visibleFilters.filter((item) => item.field === field),
            ],
      };
    });
  }, []);

  const hideFilter = useCallback(
    (field: string) => {
      setFilterVisible(field, false);
    },
    [setFilterVisible],
  );

  const removeFilter = useCallback(
    (field: string) => {
      setFilterValue(field, undefined);
      hideFilter(field);
    },
    [hideFilter, setFilterValue],
  );

  return (
    <div className="flex flex-wrap gap-1" data-slot="data-filter-tag-list">
      {visibleFilters.map((item) => {
        return (
          <DataFilterTagItem
            key={item.field}
            item={item}
            value={filterValues[item.field]}
            onChange={setFilterValue}
            onEmptyClose={hideFilter}
            onRemove={removeFilter}
          />
        );
      })}

      {hiddenFilters.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button size="xs" type="button" variant="secondary">
                <span>Add Filter</span>
                <Plus />
              </Button>
            }
          />

          <DropdownMenuContent className="w-64">
            {hiddenFilters.map(({ field, label }) => {
              return (
                <DropdownMenuItem
                  key={field}
                  onClick={() => {
                    setFilterVisible(field, true);
                  }}
                >
                  {label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
