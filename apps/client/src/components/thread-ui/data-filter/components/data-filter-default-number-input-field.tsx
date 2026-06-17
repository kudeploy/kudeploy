import type { FC } from "react";

import type { DataFilterDefaultNumberInputFieldProps } from "../interfaces/data-filter-default-number-input-field-props";
import { NumberInput } from "@/components/thread-ui/number-input";

export const DataFilterDefaultNumberInputField: FC<
  DataFilterDefaultNumberInputFieldProps
> = ({ item, value, onChange }) => {
  return (
    <div className="px-2 pb-2">
      <NumberInput
        decimalScale={item.decimalScale}
        fixedDecimalScale={item.fixedDecimalScale}
        max={item.max}
        min={item.min}
        placeholder={item.placeholder}
        step={item.step}
        value={typeof value === "number" ? value : ""}
        onValueChange={({ floatValue }) => {
          onChange(floatValue);
        }}
      />
    </div>
  );
};
