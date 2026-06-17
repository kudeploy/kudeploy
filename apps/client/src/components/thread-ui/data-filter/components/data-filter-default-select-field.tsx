import { useEffect, useRef, useState } from "react";
import type { FC } from "react";

import type { DataFilterDefaultSelectFieldProps } from "../interfaces/data-filter-default-select-field-props";
import type { DataFilterSelectOption } from "../interfaces/data-filter-select-option";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/components/ui/combobox";

export const DataFilterDefaultSelectField: FC<
  DataFilterDefaultSelectFieldProps
> = ({ item, value, onChange }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [remoteOptions, setRemoteOptions] = useState<
    Array<DataFilterSelectOption>
  >([]);
  const latestRequestId = useRef(0);
  const isRemoteOptions = typeof item.options === "function";
  const options = Array.isArray(item.options) ? item.options : remoteOptions;

  useEffect(() => {
    if (typeof item.options !== "function") {
      return;
    }

    const loadOptions = item.options;
    const requestId = latestRequestId.current + 1;
    let cancelled = false;

    latestRequestId.current = requestId;

    void loadOptions(searchQuery)
      .then((nextOptions) => {
        if (!cancelled && latestRequestId.current === requestId) {
          setRemoteOptions(nextOptions);
        }
      })
      .catch(() => {
        if (!cancelled && latestRequestId.current === requestId) {
          setRemoteOptions([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [item.options, searchQuery]);

  const selectedValues = Array.isArray(value)
    ? value.filter((optionValue): optionValue is string => {
        return typeof optionValue === "string";
      })
    : typeof value === "string"
      ? [value]
      : [];
  const optionValues = options.map((option) => option.value);
  const getOption = (optionValue: string) => {
    return options.find((option) => option.value === optionValue);
  };

  return (
    <Combobox
      multiple
      filter={isRemoteOptions ? null : undefined}
      items={optionValues}
      value={selectedValues}
      itemToStringValue={(optionValue) => {
        return getOption(optionValue)?.label ?? optionValue;
      }}
      onInputValueChange={setSearchQuery}
      onValueChange={(nextValues) => {
        onChange(nextValues.length > 0 ? nextValues : undefined);
      }}
    >
      <div className="grid gap-1">
        <ComboboxChips className="mx-2 items-start">
          <ComboboxValue>
            {selectedValues.map((optionValue) => {
              const option = getOption(optionValue);

              return (
                <ComboboxChip key={optionValue}>
                  {option?.label ?? optionValue}
                </ComboboxChip>
              );
            })}
          </ComboboxValue>
          <ComboboxChipsInput placeholder={item.placeholder} />
        </ComboboxChips>

        <ComboboxList className="max-h-72">
          {(optionValue) => {
            const option = getOption(optionValue);

            return (
              <ComboboxItem
                key={optionValue}
                className="hover:bg-accent hover:text-accent-foreground"
                value={optionValue}
              >
                {option?.label ?? optionValue}
              </ComboboxItem>
            );
          }}
        </ComboboxList>
      </div>
    </Combobox>
  );
};
