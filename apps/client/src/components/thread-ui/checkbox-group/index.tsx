"use client";

import { CheckboxGroup as CheckboxGroupPrimitive } from "@base-ui/react/checkbox-group";
import type { ComponentProps, FC } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export type CheckboxGroupProps = CheckboxGroupPrimitive.Props;

export const CheckboxGroup: FC<CheckboxGroupProps> = ({
  className,
  ...props
}) => {
  return (
    <CheckboxGroupPrimitive
      className={cn("grid w-full gap-2", className)}
      data-slot="checkbox-group"
      {...props}
    />
  );
};

export type CheckboxGroupItemProps = ComponentProps<typeof Checkbox>;

export const CheckboxGroupItem: FC<CheckboxGroupItemProps> = (props) => {
  return <Checkbox {...props} />;
};
