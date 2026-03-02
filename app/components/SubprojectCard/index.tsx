import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { Box } from "lucide-react";

import type { SubprojectCardProps } from "./types";

const SubprojectCard = (props: SubprojectCardProps) => {
  const { subproject, projectId } = props;
  const { t } = useTranslation();

  return (
    <Link
      to={`/projects/${projectId}/models/${subproject.model}`}
      className="group flex flex-col p-6 bg-surface-dark border border-white/10 hover:border-primary/50 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/5 group-hover:bg-primary/10 transition-colors">
          <Box size={24} />
        </div>
      </div>

      <h3 className="text-lg font-bold text-white-1 mb-1 group-hover:text-primary transition-colors">
        {t(`projects.models.${subproject.model}`)}
      </h3>

      <div className="mt-auto pt-6 flex items-center text-sm font-semibold text-light-gray-50 group-hover:text-primary transition-colors">
        {t("projects.view.openSubproject")}
      </div>
    </Link>
  );
};

export default SubprojectCard;
