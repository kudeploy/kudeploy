import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { t } from "i18next";

import appCss from "../styles.css?url";
import type i18n from "i18next";
import type { ApolloClientIntegration } from "@apollo/client-integration-tanstack-start";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider } from "@/components/fabric-ui/toast";
import { AlertDialogProvider } from "@/components/fabric-ui/alert-dialog";

export const Route = createRootRouteWithContext<
  ApolloClientIntegration.RouterContext & {
    i18n: typeof i18n;
    title?: string;
  }
>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: t("app.name"),
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/logo.png",
        type: "image/png",
        sizes: "100x100",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>

      <body className="bg-background min-h-screen">
        <AlertDialogProvider>
          <TooltipProvider>
            <ToastProvider>{children}</ToastProvider>
          </TooltipProvider>
        </AlertDialogProvider>

        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />

        <Scripts />
      </body>
    </html>
  );
}
