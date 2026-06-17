import { t } from "i18next";
import { Empty } from "@/components/thread-ui/empty";
import { Link } from "@/components/link";

export const NotFoundPage = () => {
  return (
    <Empty
      className="flex h-screen w-full items-center justify-center"
      description={t("notFound.description")}
      primaryAction={{
        label: t("notFound.goHome"),
        render: <Link to="/" />,
      }}
      title={t("notFound.title")}
    />
  );
};
