import { Link } from "react-router";
import { Activity, Folder } from "lucide-react";
import { useTranslation } from "react-i18next";

export const QuickActions = () => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      <Link
        to="/projects/new"
        className="group bg-surface-dark p-6 rounded-2xl border border-white/5 hover:border-primary/50 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-primary/5 flex flex-col justify-between min-h-[160px]"
      >
        <div className="flex flex-col gap-3 relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Folder size={24} />
            </div>
            <h2 className="text-xl font-bold text-white-1">
              {t("dashboard.newProject.title")}
            </h2>
          </div>
          <p className="text-light-gray-70 text-sm leading-relaxed pr-4 w-[70%]">
            {t("dashboard.newProject.desc")}
          </p>
        </div>
        <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
          <span className="text-primary font-semibold text-sm group-hover:translate-x-1 transition-transform">
            {t("dashboard.newProject.action")}
          </span>
        </div>
      </Link>

      <Link
        to="/entries/new"
        className="group bg-surface-dark p-6 rounded-2xl border border-white/5 hover:border-primary/50 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-primary/5 flex flex-col justify-between min-h-[160px]"
      >
        <div className="flex flex-col gap-3 relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity size={24} />
            </div>
            <h2 className="text-xl font-bold text-white-1">
              {t("dashboard.newEntry.title")}
            </h2>
          </div>
          <p className="text-light-gray-70 text-sm leading-relaxed pr-4 w-[85%]">
            {t("dashboard.newEntry.desc")}
          </p>
        </div>
        <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
          <span className="text-primary font-semibold text-sm group-hover:translate-x-1 transition-transform">
            {t("dashboard.newEntry.action")}
          </span>
        </div>
      </Link>
    </div>
  );
};
