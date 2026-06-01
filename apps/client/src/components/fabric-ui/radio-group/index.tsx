import type {
  RadioGroupChangeEventDetails,
  RadioGroupProps as RadioGroupPrimitiveProps,
} from "@base-ui/react";
import {
  RadioGroup as RadioGroupComponent,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

export type RadioGroupItemProps<Value extends string | null> = {
  label: string;
  description?: string;
  value: Value;
  disabled?: boolean;
};

export type RadioGroupProps<Value extends string | null> =
  RadioGroupPrimitiveProps & {
    label?: string;
    description?: string;
    items: Array<RadioGroupItemProps<Value>>;
    value?: Value;
    defaultValue?: Value;
    onValueChange?: (
      value: Value,
      eventDetails: RadioGroupChangeEventDetails,
    ) => void;
  };

export function RadioGroup<Value extends string | null>({
  className,
  label,
  description,
  disabled,
  items,
  ...props
}: RadioGroupProps<Value>) {
  return (
    <FieldSet className={cn(className)}>
      {label && <FieldLegend variant="label">{label}</FieldLegend>}
      {description && <FieldDescription>{description}</FieldDescription>}

      <RadioGroupComponent disabled={disabled} {...props}>
        {items.map((item) => (
          <Field
            key={item.value}
            data-disabled={disabled || item.disabled}
            orientation="horizontal"
          >
            <RadioGroupItem disabled={item.disabled} value={item.value} />
            <FieldContent>
              {item.label && <FieldLabel>{item.label}</FieldLabel>}
              {item.description && (
                <FieldDescription>{item.description}</FieldDescription>
              )}
            </FieldContent>
          </Field>
        ))}
      </RadioGroupComponent>
    </FieldSet>
  );
}
