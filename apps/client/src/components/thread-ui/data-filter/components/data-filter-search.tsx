import { Search } from "lucide-react";

import { useState } from "react";
import type { FC } from "react";
import type { DataFilterSearchProps } from "../interfaces/data-filter-search-props";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";

export const DataFilterSearch: FC<DataFilterSearchProps> = ({
  className,
  disabled,
  loading,
  placeholder,
  value,
  onChange,
}) => {
  const [query, setQuery] = useState(value ?? "");
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setQuery(value ?? "");
  }

  const emitChange = () => {
    onChange?.(query);
  };

  return (
    <div
      className="flex min-w-0 items-center gap-2"
      data-slot="data-filter-search"
    >
      <InputGroup className={className}>
        <InputGroupInput
          disabled={disabled}
          placeholder={placeholder}
          value={query}
          onBlur={emitChange}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();

              emitChange();
            }
          }}
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        {loading && (
          <InputGroupAddon align="inline-end">
            <Spinner />
          </InputGroupAddon>
        )}
      </InputGroup>
    </div>
  );
};
