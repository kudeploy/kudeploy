import { t } from "i18next";

import { Badge } from "@/components/thread-ui/badge";

const statusColors = {
  FAILED: "red",
  PENDING: "slate",
  PROGRESSING: "amber",
  READY: "green",
  UNKNOWN: "gray",
} as const;

type Status = keyof typeof statusColors;

export function StatusBadge({
  namespace,
  status,
}: {
  namespace: "project" | "service";
  status: Status;
}) {
  return (
    <Badge color={statusColors[status]} data-testid={`${namespace}-status`}>
      {t(`${namespace}:status.${status}`)}
    </Badge>
  );
}
