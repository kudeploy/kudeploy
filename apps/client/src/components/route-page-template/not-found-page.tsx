import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/link";
import { t } from "i18next";

export const NotFoundPage = () => {
  return (
    <Empty className="flex h-screen w-full items-center justify-center">
      <EmptyHeader>
        <EmptyTitle>{t("notFound.title")}</EmptyTitle>
        <EmptyDescription>{t("notFound.description")}</EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        <div className="flex gap-2">
          <Button render={<Link to="/">{t("notFound.goHome")}</Link>} />
        </div>
      </EmptyContent>
    </Empty>
  );
};
