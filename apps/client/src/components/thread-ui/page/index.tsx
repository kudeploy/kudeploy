"use client";

import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, FC } from "react";

import { cn } from "@/lib/utils";

const pageVariants = cva(
  "mx-auto flex min-h-min w-full flex-1 flex-col p-4 @container/page",
  {
    variants: {
      variant: {
        full: "w-full",
        default: "max-w-5xl",
        compact: "max-w-xl",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type PageProps = ComponentProps<"div"> &
  VariantProps<typeof pageVariants>;

export const Page: FC<PageProps> = ({ className, variant, ...props }) => {
  return (
    <div className={cn(pageVariants({ variant }), className)} {...props} />
  );
};

export type PageHeaderProps = ComponentProps<"header">;

export const PageHeader: FC<PageHeaderProps> = ({ className, ...props }) => {
  return (
    <header
      data-slot="page-header"
      className={cn(
        "grid gap-1 pb-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]",
        className,
      )}
      {...props}
    />
  );
};

export type PageTitleProps = ComponentProps<"h2">;

export const PageTitle: FC<PageTitleProps> = ({ className, ...props }) => {
  return (
    <h2
      className={cn("text-xl font-semibold tracking-tight", className)}
      data-slot="page-title"
      {...props}
    />
  );
};

export type PageDescriptionProps = ComponentProps<"p">;

export const PageDescription: FC<PageDescriptionProps> = ({
  className,
  ...props
}) => {
  return (
    <p
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="page-description"
      {...props}
    />
  );
};

export type PageActionProps = ComponentProps<"div">;

export const PageAction: FC<PageActionProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="page-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
};

export type PageContentProps = ComponentProps<"div">;

export const PageContent: FC<PageContentProps> = ({ className, ...props }) => {
  return <div className={cn("flex-1", className)} {...props} />;
};
