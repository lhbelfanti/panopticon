import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { Box, Zap } from "lucide-react";

import type { SubprojectCardProps } from "./types";

const SubprojectCard = (props: SubprojectCardProps) => {
  const { subproject, projectId } = props;
  const { t } = useTranslation();

  const cardClasses = "group flex flex-col p-6 bg-surface-dark border border-white/10 hover:border-primary/50 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 relative";

  return (
    <div className={cardClasses}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/5 group-hover:bg-primary/10 transition-colors">
          <Box size={24} />
        </div>

        <Link
          to={`/projects/${projectId}/models/${subproject.model}/analysis`}
          className="text-xs font-bold text-light-gray-60 hover:text-primary transition-colors uppercase tracking-widest flex items-center gap-1.5 p-2 bg-white/5 rounded-lg border border-white/5 hover:border-primary/30"
          title={t("projects.entries.analysis")}
        >
          <Zap size={14} className="text-primary" />
          {t("projects.entries.analysis")}
        </Link>
      </div>

      <Link to={`/projects/${projectId}/models/${subproject.model}`} className="flex-1">
        <h3 className="text-xl font-extrabold text-white-1 mb-2 group-hover:text-primary transition-colors tracking-tight">
          {t(`projects.models.${subproject.model}`)}
        </h3>
        <p className="text-light-gray-60 text-sm leading-relaxed mb-6">
          {t("projects.view.subprojectsDesc").split('.')[0]}.
        </p>
      </Link>

      <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
        <Link
          to={`/projects/${projectId}/models/${subproject.model}`}
          className="text-sm font-bold text-light-gray-50 hover:text-white-1 transition-colors flex items-center gap-2"
        >
          {t("projects.view.openSubproject")}
        </Link>
      </div>
    </div>
  );
};

export default SubprojectCard;
