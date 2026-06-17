import { ChevronDown, Trash2 } from "lucide-react";
import dayjs from "dayjs";
import { useState } from "react";

import {
  createDataFilterCondition,
  formatRenderValue,
  getDataFilterCondition,
  getDataFilterOperatorLabel,
  getDataFilterOperators,
  getDefaultDataFilterOperator,
  isEmpty,
} from "../utils";
import { DataFilterDefaultField } from "./data-filter-default-field";
import { DataFilterOperatorSelect } from "./data-filter-operator-select";
import type { DataFilterItemBaseProps } from "../interfaces/data-filter-item-base-props";
import type { DataFilterTagItemProps } from "../interfaces/data-filter-tag-item-props";
import type { FC } from "react";
import type { DataFilterOperator } from "../types";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const DataFilterTagItem: FC<DataFilterTagItemProps> = ({
  item,
  value: fieldValue,
  onChange,
  onEmptyClose,
  onRemove,
}) => {
  const { field, label } = item;
  const operators = getDataFilterOperators(item);
  const getOperator = (value: unknown): DataFilterOperator => {
    const condition = getDataFilterCondition(value);
    const isEmptyCondition =
      condition.value === null &&
      (condition.operator === "$eq" || condition.operator === "$ne");

    return condition.operator &&
      (operators.includes(condition.operator) || isEmptyCondition)
      ? condition.operator
      : getDefaultDataFilterOperator(item);
  };
  const [operator, setOperator] = useState(() => getOperator(fieldValue));
  const [prevFieldValue, setPrevFieldValue] = useState(fieldValue);
  const rawValue = getDataFilterCondition(fieldValue).value;
  const renderValue = item.renderValue as
    | DataFilterItemBaseProps<unknown>["renderValue"]
    | undefined;

  if (fieldValue !== prevFieldValue) {
    setPrevFieldValue(fieldValue);
    setOperator(getOperator(fieldValue));
  }

  const getDefaultValue = (): unknown => {
    if (item.type === "date-picker") {
      const date =
        rawValue instanceof Date || typeof rawValue === "string"
          ? dayjs(rawValue)
          : undefined;

      return date?.isValid() ? date.format("YYYY-MM-DD") : rawValue;
    }

    if (item.type === "checkbox") {
      if (rawValue === true) {
        return "Checked";
      }

      if (rawValue === false) {
        return "Unchecked";
      }
    }

    if (item.type === "select") {
      const values = Array.isArray(rawValue) ? rawValue : [rawValue];
      const options = Array.isArray(item.options) ? item.options : [];

      return values
        .map((optionValue) => {
          return (
            options.find((option) => option.value === optionValue)?.label ??
            optionValue
          );
        })
        .join(", ");
    }

    return formatRenderValue({
      [field]: rawValue,
    })[field];
  };

  const getValue = (): string | undefined => {
    if (isEmpty(rawValue)) {
      return undefined;
    }

    if (rawValue === null) {
      return "empty";
    }

    return String(
      typeof renderValue !== "undefined"
        ? renderValue({
            field,
            label,
            operator,
            value: rawValue,
          })
        : getDefaultValue(),
    );
  };

  const handleOperatorChange = (
    nextOperator: DataFilterOperator,
    value: unknown,
  ) => {
    setOperator(nextOperator);
    onChange(field, createDataFilterCondition(nextOperator, value));
  };

  const handleValueChange = (value: unknown) => {
    onChange(field, createDataFilterCondition(operator, value));
  };

  const remove = () => {
    onRemove(field);
  };

  const render = item.render as
    | DataFilterItemBaseProps<unknown>["render"]
    | undefined;
  const value = getValue();
  const shouldRenderContent = rawValue !== null;
  const labelValue = value
    ? `${label} ${getDataFilterOperatorLabel(operator)} ${value}`
    : `${label} ${getDataFilterOperatorLabel(operator)}`;

  return (
    <Popover
      key={field}
      defaultOpen={isEmpty(rawValue)}
      modal={true}
      onOpenChange={(open) => {
        // Remove empty filters when their popover closes.
        if (!open && isEmpty(rawValue)) {
          onEmptyClose(field);
        }
      }}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <PopoverTrigger
                render={
                  <Button
                    className="max-w-72 min-w-0"
                    size="xs"
                    variant="secondary"
                  >
                    <span className="truncate">{labelValue}</span>
                    <ChevronDown />
                  </Button>
                }
              />
            }
          />
          <TooltipContent>{labelValue}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent
        align="start"
        className="grid w-fit max-w-64 min-w-48 gap-1 p-1"
      >
        <div
          className="flex items-center justify-between"
          data-slot="data-filter-tag-item-header"
        >
          <DataFilterOperatorSelect
            item={item}
            operator={operator}
            value={rawValue}
            onChange={handleOperatorChange}
          />

          <Button size="icon-xs" variant="ghost" onClick={remove}>
            <Trash2 />
          </Button>
        </div>

        {shouldRenderContent && (
          <div data-slot="data-filter-tag-item-content">
            {render ? (
              render({
                operator,
                field: {
                  value: rawValue,
                  onChange: handleValueChange,
                },
              })
            ) : (
              <DataFilterDefaultField
                item={item}
                operator={operator}
                value={rawValue}
                onChange={handleValueChange}
              />
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
