import { useMemo, useState } from "react";
import { Form } from "react-router";
import { Trans, useTranslation } from "react-i18next";

import { AdverseBehaviorLabel } from "~/components/AdverseBehaviorLabel";
import { CustomCheckbox } from "~/components/ui/CustomCheckbox";

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
  const { actionData, isSubmitting, behaviorConfigs, mode = "create", initialData } = props;
  const { t } = useTranslation();

  const isEdit = mode === "edit";

  // Track selected behaviors to compute available models (intersection)
  const [selectedBehaviors, setSelectedBehaviors] = useState<string[]>(
    initialData?.behaviors || []
  );

  const handleBehaviorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isEdit) return; // Behaviors are locked in edit mode
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

  return (
    <Form method="post" className="p-8 lg:p-10 flex flex-col gap-8" id="project-form">
      {mode === "edit" && <input type="hidden" name="intent" value="update_project" />}
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
            defaultValue={initialData?.name}
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
            defaultValue={initialData?.description}
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
            const isSelected = selectedBehaviors.includes(config.id);

            return (
              <CustomCheckbox
                key={config.id}
                name="behaviors"
                value={config.id}
                checked={isSelected}
                disabled={!isEnabled || isEdit}
                onChange={handleBehaviorChange}
                notAvailableText={t("common.notAvailable")}
                wrapperClassName={`p-4 bg-background-dark/50 pl-3 pr-4 ${isEdit ? "opacity-60 cursor-not-allowed" : ""}`}
                icon={
                  <div
                    className={`p-1.5 rounded-md flex-shrink-0 ${config.bgClass} ${config.colorClass}`}
                  >
                    <IconComponent size={16} />
                  </div>
                }
                label={t(`projects.behaviors.${config.id}`)}
              />
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
          {availableModels.map((m) => {
            const isInitiallySelected = initialData?.models.includes(m);
            return (
              <CustomCheckbox
                key={m}
                name="models"
                value={m}
                checked={isInitiallySelected || undefined}
                disabled={isInitiallySelected}
                wrapperClassName={`p-4 bg-background-dark/50 ${isInitiallySelected ? "opacity-60 cursor-not-allowed" : ""}`}
                label={t(`projects.models.${m}`)}
              />
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4 mt-2">
        <button
          type="submit"
          disabled={isSubmitting || (availableModels.length === 0 && !isEdit)}
          className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary/90 text-background-dark font-bold rounded-lg transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none float-right"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-background-dark/30 border-t-background-dark rounded-full animate-spin" />
              <span>{isEdit ? t("projects.edit.saving") : t("projects.new.creating")}</span>
            </>
          ) : (
            <span>{isEdit ? t("projects.edit.submit") : t("projects.new.submit")}</span>
          )}
        </button>
      </div>
    </Form>
  );
};
