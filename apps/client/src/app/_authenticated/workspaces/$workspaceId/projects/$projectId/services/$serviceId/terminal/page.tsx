import { useEffect, useRef, useState } from "react";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { createFileRoute } from "@tanstack/react-router";
import { t } from "i18next";
import { Terminal as TerminalIcon } from "lucide-react";
import { io } from "socket.io-client";
import { useXTerm } from "react-xtermjs";
import type { Socket } from "socket.io-client";

import { Page } from "@/components/fabric-ui/page";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute(
  "/_authenticated/workspaces/$workspaceId/projects/$projectId/services/$serviceId/terminal/",
)({
  component: ServiceTerminalComponent,
  beforeLoad: () => ({ title: null }),
});

type ConnectionStatus = "connecting" | "connected" | "disconnected";

function ServiceTerminalComponent() {
  const { workspaceId, projectId, serviceId } = Route.useParams();
  const service = Route.useRouteContext({
    select: (context) => context.service,
  });
  const { instance, ref } = useXTerm();
  const terminalReadyRef = useRef(false);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!instance) {
      return;
    }

    instance.options.cursorBlink = true;
    instance.options.disableStdin = true;
    instance.options.fontFamily =
      'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", monospace';
    instance.options.theme = {
      background: "#050505",
      foreground: "#f5f5f5",
      cursor: "#f5f5f5",
      selectionBackground: "#3f3f46",
    };

    const fitAddon = new FitAddon();
    instance.loadAddon(fitAddon);
    const socket: Socket = io("/service-terminal", {
      auth: { workspaceId },
      transports: ["websocket"],
    });

    const fitAndResize = () => {
      try {
        fitAddon.fit();

        if (socket.connected) {
          socket.emit("resize", {
            cols: instance.cols,
            rows: instance.rows,
          });
        }
      } catch {
        // The terminal can be briefly detached during route transitions.
      }
    };

    const setTerminalReady = (ready: boolean) => {
      terminalReadyRef.current = ready;
      instance.options.disableStdin = !ready;
    };

    setTerminalReady(false);
    setStatus("connecting");
    setError(null);

    socket.on("connect", () => {
      setStatus("connecting");
      setError(null);
      fitAndResize();
      socket.emit("start", {
        projectId,
        serviceId,
      });
    });

    socket.on("connect_error", (connectError) => {
      setTerminalReady(false);
      setStatus("disconnected");
      setError(connectError.message);
    });

    socket.on("disconnect", () => {
      setTerminalReady(false);
      setStatus("disconnected");
    });

    socket.on("started", () => {
      setTerminalReady(true);
      setStatus("connected");
      fitAndResize();
      instance.focus();
    });

    socket.on("data", (data: string) => {
      instance.write(data);
    });

    socket.on("error", (socketError: { message?: string } | string) => {
      setTerminalReady(false);
      setStatus("disconnected");
      setError(
        typeof socketError === "string"
          ? socketError
          : (socketError.message ?? t("service:terminal.error")),
      );
    });

    const dataDisposable = instance.onData((data) => {
      if (socket.connected && terminalReadyRef.current) {
        socket.emit("data", { data });
      }
    });
    const resizeDisposable = instance.onResize(({ cols, rows }) => {
      if (socket.connected) {
        socket.emit("resize", { cols, rows });
      }
    });

    const animationFrame = window.requestAnimationFrame(fitAndResize);
    window.addEventListener("resize", fitAndResize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", fitAndResize);
      dataDisposable.dispose();
      resizeDisposable.dispose();
      fitAddon.dispose();
      setTerminalReady(false);
      socket.disconnect();
    };
  }, [instance, projectId, serviceId, workspaceId]);

  return (
    <Page
      title={t("service:tabs.terminal")}
      description={t("service:terminal.description")}
    >
      <div className="space-y-4" data-testid="service-terminal-page">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TerminalIcon className="size-4" />
              {t("service:terminal.title")}
            </CardTitle>
            <CardDescription>{service.name}</CardDescription>
            <CardAction>
              <div
                className="text-muted-foreground flex items-center gap-2 text-sm"
                data-testid="service-terminal-status"
              >
                <span
                  className={
                    status === "connected"
                      ? "size-2 rounded-full bg-emerald-500"
                      : status === "connecting"
                        ? "size-2 rounded-full bg-amber-500"
                        : "size-2 rounded-full bg-red-500"
                  }
                />
                {t(`service:terminal.status.${status}`)}
              </div>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-3">
            {error && (
              <div
                className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm"
                data-testid="service-terminal-error"
              >
                {error}
              </div>
            )}
            <div
              className="h-[min(60vh,560px)] min-h-96 overflow-hidden rounded-lg bg-black p-2"
              onPointerDown={() => {
                if (terminalReadyRef.current) {
                  instance?.focus();
                }
              }}
            >
              <div ref={ref} className="size-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
