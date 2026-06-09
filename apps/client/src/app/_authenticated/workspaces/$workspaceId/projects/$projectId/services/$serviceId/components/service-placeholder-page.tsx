import { t } from "i18next";

import { Page } from "@/components/fabric-ui/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ServicePlaceholderPage({
  title,
  testId,
}: {
  title: string;
  testId: string;
}) {
  return (
    <Page title={title} description={t("service:placeholder.description")}>
      <div data-testid={testId}>
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            {t("service:placeholder.body")}
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
