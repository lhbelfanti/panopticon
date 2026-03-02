import { useMemo, useState } from "react";
import { Form } from "react-router";
import { Trans, useTranslation } from "react-i18next";

import { AdverseBehaviorLabel } from "~/components/AdverseBehaviorLabel";

import * as LucideIcons from "lucide-react";

import type { BehaviorConfig } from "~/services/api/projects/types";
import type { NewProjectFormProps } from "./types";

const modelsList = [
  "bert_spanish",
  "roberta_english",
  "llama3_zero_shot",
  "svm_baseline",
];

export const NewProjectForm = (props: NewProjectFormProps) => {
  const { actionData, isSubmitting, behaviorConfigs } = props;
  const { t } = useTranslation();

  // Track selected behaviors to compute available models (intersection)
  const [selectedBehaviors, setSelectedBehaviors] = useState<string[]>([]);

  const handleBehaviorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (e.target.checked) {
      setSelectedBehaviors((prev) => [...prev, val]);
    } else {
      setSelectedBehaviors((prev) => prev.filter((b) => b !== val));
    }
  };

  // Calculate intersected models
  const availableModels = useMemo(() => {
    if (selectedBehaviors.length === 0) return [];

    let intersected: string[] | null = null;

    for (const bId of selectedBehaviors) {
      const config = behaviorConfigs.find((c) => c.id === bId);
      if (!config) continue;

      if (intersected === null) {
        intersected = config.availableModels;
      } else {
        intersected = intersected.filter((m) =>
          config.availableModels.includes(m as any),
        );
      }
    }

    return intersected || [];
  }, [selectedBehaviors, behaviorConfigs]);

  const inputClassName =
    "w-full bg-sidebar-dark border border-white/10 rounded-lg p-3.5 text-white-1 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:opacity-30 shadow-inner";
  const checkboxLabelClassName =
    "flex items-center gap-3 p-4 rounded-xl border border-white/5 hover:border-primary/50 bg-background-dark/50 cursor-pointer transition-all hover:shadow-lg hover:shadow-primary/5 group h-full";
  const checkboxInputClassName =
    "peer appearance-none w-5 h-5 border-2 border-white/20 rounded bg-transparent checked:bg-primary checked:border-primary transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0";

  return (
    <Form method="post" className="p-8 lg:p-10 flex flex-col gap-8">
      {actionData?.error && (
        <div className="p-4 bg-red-900/30 border border-red-500/50 text-red-200 rounded-lg text-sm font-medium">
          {actionData.error}
        </div>
      )}

      {/* Name and Description */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-semibold text-light-gray tracking-wide"
            htmlFor="name"
          >
            {t("projects.new.name")}
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            className={inputClassName}
            placeholder={t("projects.new.namePlaceholder")}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-semibold text-light-gray tracking-wide"
            htmlFor="description"
          >
            {t("projects.new.description")}
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            className={`${inputClassName} resize-none custom-scrollbar`}
            placeholder={t("projects.new.descriptionPlaceholder")}
          />
        </div>
      </div>

      <hr className="border-white/5" />

      {/* Behaviors */}
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-bold text-white-1">
            {t("projects.new.behaviorsTitle")}
          </h3>
          <p className="text-sm text-light-gray-70 mt-1 leading-relaxed">
            <Trans i18nKey="projects.new.behaviorsDesc" components={{ 1: <AdverseBehaviorLabel /> }} />
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {behaviorConfigs.map((config) => {
            const IconComponent =
              (LucideIcons as any)[config.iconName] || LucideIcons.Circle;
            const isEnabled = config.enabled;

            return (
              <label
                key={config.id}
                title={!isEnabled ? t("common.notAvailable") : undefined}
                className={`${checkboxLabelClassName} ${!isEnabled ? "opacity-50 cursor-not-allowed border-white/5 hover:border-white/5 hover:shadow-none bg-black/20" : ""}`}
              >
                <div className="relative flex items-center justify-center flex-shrink-0">
                  <input
                    type="checkbox"
                    name="behaviors"
                    value={config.id}
                    disabled={!isEnabled}
                    onChange={handleBehaviorChange}
                    className={checkboxInputClassName}
                  />
                  <svg
                    className="absolute w-3.5 h-3.5 text-background-dark opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="flex items-center gap-2 overflow-hidden w-full h-full">
                  <div
                    className={`p-1.5 rounded-md flex-shrink-0 ${config.bgClass} ${config.colorClass} ${!isEnabled && "saturate-0 opacity-50"}`}
                  >
                    <IconComponent size={16} />
                  </div>
                  <span
                    className={`text-sm font-medium transition-colors break-words leading-tight ${isEnabled ? "text-light-gray-80 group-hover:text-white-1" : "text-light-gray-60"}`}
                    title={t(`projects.behaviors.${config.id}`)}
                  >
                    {t(`projects.behaviors.${config.id}`)}
                  </span>
                </div>
                {!isEnabled && (
                  <span className="text-[0.6rem] uppercase tracking-wider font-bold bg-white/10 px-1.5 py-0.5 rounded text-light-gray-60 flex-shrink-0 ml-auto mr-1 self-start mt-0.5">
                    {t("common.notAvailable")}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      <hr className="border-white/5" />

      {/* Models */}
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-bold text-white-1">
            {t("projects.new.modelsTitle")}
          </h3>
          <p className="text-sm text-light-gray-70 mt-1 leading-relaxed">
            <Trans i18nKey="projects.new.modelsDesc" components={{ 1: <AdverseBehaviorLabel /> }} />
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableModels.length === 0 && selectedBehaviors.length > 0 && (
            <div className="col-span-1 md:col-span-2 p-4 text-center text-sm text-bittersweet-shimmer border border-bittersweet-shimmer/20 bg-bittersweet-shimmer/10 rounded-xl">
              {t("projects.new.noModelsIntersection")}
            </div>
          )}
          {availableModels.length === 0 && selectedBehaviors.length === 0 && (
            <div className="col-span-1 md:col-span-2 p-4 text-center text-sm text-light-gray-70 border border-white/5 bg-white/5 rounded-xl">
              {t("projects.new.selectBehaviorFirst")}
            </div>
          )}
          {availableModels.map((m) => (
            <label key={m} className={checkboxLabelClassName}>
              <div className="relative flex items-center justify-center flex-shrink-0">
                <input
                  type="checkbox"
                  name="models"
                  value={m}
                  className={checkboxInputClassName}
                />
                <svg
                  className="absolute w-3.5 h-3.5 text-background-dark opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-light-gray-80 text-sm font-medium group-hover:text-white-1 transition-colors break-words text-left w-full pl-2">
                {t(`projects.models.${m}`)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4 mt-2">
        <button
          type="submit"
          disabled={isSubmitting || availableModels.length === 0}
          className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary/90 text-background-dark font-bold rounded-lg transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none float-right"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-background-dark/30 border-t-background-dark rounded-full animate-spin" />
              <span>{t("projects.new.creating")}</span>
            </>
          ) : (
            <span>{t("projects.new.submit")}</span>
          )}
        </button>
      </div>
    </Form>
  );
};
