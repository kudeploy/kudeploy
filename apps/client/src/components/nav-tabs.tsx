import type { LinkProps } from "@tanstack/react-router";
import type { FC } from "react";

import { Link } from "@/components/link";
import { cn } from "@/lib/utils";

export interface NavTabsProps {
  tabs: Array<{
    title: string;
    link: LinkProps;
    testId?: string;
  }>;
}

export const NavTabs: FC<NavTabsProps> = ({ tabs }) => {
  return (
    <div className="border-border border-b px-4">
      <nav aria-label="Tabs" className="-mb-px flex h-12 overflow-x-auto">
        {tabs.map((tab) => (
          <Link
            key={tab.title}
            {...tab.link}
            data-testid={tab.testId}
            className={cn(
              "text-muted-foreground hover:border-border hover:text-foreground flex h-full items-center border-b-2 border-transparent px-3 text-sm font-medium whitespace-nowrap transition-colors",
              "data-active:border-primary data-active:text-primary",
            )}
          >
            {tab.title}
          </Link>
        ))}
      </nav>
    </div>
  );
};
