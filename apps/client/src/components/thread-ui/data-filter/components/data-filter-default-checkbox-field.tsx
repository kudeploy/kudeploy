import { CheckIcon } from "lucide-react";
import type { FC } from "react";

import type { DataFilterDefaultCheckboxFieldProps } from "../interfaces/data-filter-default-checkbox-field-props";

export const DataFilterDefaultCheckboxField: FC<
  DataFilterDefaultCheckboxFieldProps
> = ({ value, onChange }) => {
  return (
    <div className="grid">
      {[
        { label: "Unchecked", value: false },
        { label: "Checked", value: true },
      ].map((option) => {
        const selected = value === option.value;

        return (
          <button
            key={String(option.value)}
            className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            type="button"
            onClick={() => {
              onChange(option.value);
            }}
          >
            <span className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
              {option.label}
            </span>
            <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
              {selected && <CheckIcon />}
            </span>
          </button>
        );
      })}
    </div>
  );
};
