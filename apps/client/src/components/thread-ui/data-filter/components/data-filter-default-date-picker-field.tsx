import dayjs from "dayjs";
import type { FC } from "react";

import type { DataFilterDefaultDatePickerFieldProps } from "../interfaces/data-filter-default-date-picker-field-props";
import { Calendar } from "@/components/ui/calendar";

const getDate = (value: unknown): Date | undefined => {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const date = dayjs(value);

  return date.isValid() ? date.toDate() : undefined;
};

export const DataFilterDefaultDatePickerField: FC<
  DataFilterDefaultDatePickerFieldProps
> = ({ item, value, onChange }) => {
  const min = getDate(item.min);
  const max = getDate(item.max);
  const selected = getDate(value);

  return (
    <Calendar
      className="p-0 px-2 pb-2"
      defaultMonth={selected}
      mode="single"
      selected={selected}
      disabled={(date) => {
        return (
          (typeof min !== "undefined" && dayjs(date).isBefore(min, "day")) ||
          (typeof max !== "undefined" && dayjs(date).isAfter(max, "day"))
        );
      }}
      onSelect={(date) => {
        onChange(date ? date.toISOString() : undefined);
      }}
    />
  );
};
