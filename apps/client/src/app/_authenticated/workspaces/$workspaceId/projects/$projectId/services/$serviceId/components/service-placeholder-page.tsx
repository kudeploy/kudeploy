import { t } from "i18next";

import {
  Page,
  PageContent,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/thread-ui/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ServicePlaceholderPage({
  title,
  testId,
}: {
  title: string;
  testId: string;
}) {
  return (
    <Page>
      <PageHeader>
        <PageTitle>{title}</PageTitle>
        <PageDescription>
          {t("service:placeholder.description")}
        </PageDescription>
      </PageHeader>
      <PageContent>
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
      </PageContent>
    </Page>
  );
}
