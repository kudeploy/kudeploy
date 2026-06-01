import { EllipsisVertical } from "lucide-react";
import type { ComponentProps, FC, ReactElement, ReactNode } from "react";
import { Button } from "@/components/fabric-ui/button";
import {
  PageAction,
  Page as PageComponent,
  PageContent,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/thread-ui/page";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type PageActionProps = {
  disabled?: boolean;
  icon?: ReactElement;
  label: string;
  onClick?: () => void;
  render?: ReactElement;
  testId?: string;
};

export type PageProps = ComponentProps<typeof PageComponent> & {
  title: ReactNode;
  description?: ReactNode;
  primaryAction?: PageActionProps;
  secondaryActions?: Array<PageActionProps>;
};

export const Page: FC<PageProps> = ({
  children,
  title,
  description,
  primaryAction,
  secondaryActions,
  ...props
}) => {
  return (
    <PageComponent {...props}>
      <PageHeader>
        <PageTitle>{title}</PageTitle>
        {description && <PageDescription>{description}</PageDescription>}

        {(primaryAction ||
          (secondaryActions && secondaryActions?.length > 0)) && (
          <>
            {/* Desktop */}
            <PageAction className="hidden @md/page:flex">
              <div className="flex gap-2">
                {secondaryActions?.map((action, index) => (
                  <Button
                    key={action.label ?? index}
                    disabled={action.disabled}
                    data-testid={action.testId}
                    render={action.render}
                    variant="secondary"
                    onClick={action.onClick}
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                ))}

                {primaryAction && (
                  <Button
                    key={primaryAction.label}
                    disabled={primaryAction.disabled}
                    data-testid={primaryAction.testId}
                    render={primaryAction.render}
                    onClick={primaryAction.onClick}
                  >
                    {primaryAction.icon}
                    {primaryAction.label}
                  </Button>
                )}
              </div>
            </PageAction>

            {/* Mobile */}
            <PageAction className="flex @md/page:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button size="icon" variant="secondary">
                      <EllipsisVertical />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  {primaryAction && (
                    <DropdownMenuItem
                      key={primaryAction.label}
                      disabled={primaryAction.disabled}
                      data-testid={primaryAction.testId}
                      render={primaryAction.render}
                      onClick={primaryAction.onClick}
                    >
                      {primaryAction.icon}
                      {primaryAction.label}
                    </DropdownMenuItem>
                  )}

                  {secondaryActions?.map((action, index) => (
                    <DropdownMenuItem
                      key={action.label ?? index}
                      disabled={action.disabled}
                      data-testid={action.testId}
                      render={action.render}
                      onClick={action.onClick}
                    >
                      {action.icon}
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </PageAction>
          </>
        )}
      </PageHeader>
      <PageContent>{children}</PageContent>
    </PageComponent>
  );
};
