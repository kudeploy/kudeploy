import type { ToasterProps } from "sonner";
import type { FC, PropsWithChildren } from "react";
import { Toaster } from "@/components/ui/sonner";

export type ToastProviderProps = PropsWithChildren<ToasterProps>;

export const ToastProvider: FC<ToastProviderProps> = ({
  children,
  ...props
}) => {
  return (
    <>
      <Toaster {...props} />
      {children}
    </>
  );
};

export { toast } from "sonner";
