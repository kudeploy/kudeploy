import { DataFilterDefaultCheckboxField } from "./data-filter-default-checkbox-field";
import { DataFilterDefaultDatePickerField } from "./data-filter-default-date-picker-field";
import { DataFilterDefaultInputField } from "./data-filter-default-input-field";
import { DataFilterDefaultNumberInputField } from "./data-filter-default-number-input-field";
import { DataFilterDefaultSelectField } from "./data-filter-default-select-field";
import type { FC } from "react";

import type { DataFilterDefaultFieldProps } from "../interfaces/data-filter-default-field-props";

export const DataFilterDefaultField: FC<DataFilterDefaultFieldProps> = ({
  item,
  value,
  onChange,
}) => {
  if (item.type === "number-input") {
    return (
      <DataFilterDefaultNumberInputField
        item={item}
        value={value}
        onChange={onChange}
      />
    );
  }

  if (item.type === "date-picker") {
    return (
      <DataFilterDefaultDatePickerField
        item={item}
        value={value}
        onChange={onChange}
      />
    );
  }

  if (item.type === "checkbox") {
    return (
      <DataFilterDefaultCheckboxField
        item={item}
        value={value}
        onChange={onChange}
      />
    );
  }

  if (item.type === "select") {
    return (
      <DataFilterDefaultSelectField
        item={item}
        value={value}
        onChange={onChange}
      />
    );
  }

  return (
    <DataFilterDefaultInputField
      item={item}
      value={value}
      onChange={onChange}
    />
  );
};
