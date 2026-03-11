import { Trans, useTranslation } from "react-i18next";
import { useLoaderData } from "react-router";

import {
  getDashboardSummary,
  getRecentActivities,
} from "~/services/api/dashboard/index.server";

import { QuickActions } from "~/components/Dashboard/QuickActions";
import { RecentActivity } from "~/components/Dashboard/RecentActivity";
import { SummaryGrid } from "~/components/Dashboard/SummaryGrid";
import { AdverseBehaviorLabel } from "~/components/AdverseBehaviorLabel";

import { isAuthenticated } from "~/services/api/auth/session.server";
import { i18next } from "~/localization/i18n.server";

import type { MetaFunction } from "react-router";
import { redirect } from "react-router";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `Panopticon - ${data?.title}` },
    {
      name: "description",
      content: "Adverse Human Behaviour Analysis Platform",
    },
  ];
};

export const loader = async ({ request }: { request: Request }) => {
  const isAuth = await isAuthenticated(request);
  if (!isAuth) {
    return redirect("/login");
  }

  const t = await i18next.getFixedT(request);
  const title = t("titles.dashboard");

  const [summary, activities] = await Promise.all([
    getDashboardSummary(),
    getRecentActivities(),
  ]);

  return { summary, recentActivities: activities, title };
};

const Index = () => {
  const { summary, recentActivities } = useLoaderData<typeof loader>();
  const { t, i18n } = useTranslation();

  return (
    <div className="flex-1 p-8 lg:p-12 overflow-y-auto bg-background-dark min-h-screen custom-scrollbar">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-white-1 mb-2 tracking-tight">
            {t("dashboard.welcome")}
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-light-gray-70 text-lg flex items-center gap-2">
              <Trans i18nKey="dashboard.subtitle" components={{ 1: <AdverseBehaviorLabel /> }} />
            </p>
          </div>
        </div>
      </div>

      <QuickActions />
      <SummaryGrid summary={summary} />
      <RecentActivity recentActivities={recentActivities} />
    </div>
  );
};

export default Index;
