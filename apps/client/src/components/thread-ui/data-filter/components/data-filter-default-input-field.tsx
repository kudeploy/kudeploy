import type { FC } from "react";

import type { DataFilterDefaultInputFieldProps } from "../interfaces/data-filter-default-input-field-props";
import { Input } from "@/components/ui/input";

export const DataFilterDefaultInputField: FC<
  DataFilterDefaultInputFieldProps
> = ({ item, value, onChange }) => {
  return (
    <div className="px-2 pb-2">
      <Input
        placeholder={item.placeholder}
        value={typeof value === "string" ? value : ""}
        onChange={(event) => {
          onChange(event.target.value || undefined);
        }}
      />
    </div>
  );
};
