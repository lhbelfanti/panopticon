import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CustomCheckbox } from "~/components/ui/CustomCheckbox";
import type { ConfigurationSectionProps } from "./types";

export const ConfigurationSection = (props: ConfigurationSectionProps) => {
    const {
        projects,
        platforms,
        selectedProjectId,
        selectedPlatform,
        selectedSubprojects,
        onProjectChange,
        onPlatformChange,
        onToggleSubproject
    } = props;
    const { t } = useTranslation();

    const selectedProject = useMemo(() => projects.find(p => p.id === selectedProjectId), [projects, selectedProjectId]);

    const handleProjectSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        onProjectChange(val ? parseInt(val) : "");
    };

    return (
        <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 shadow-xl mb-8 flex flex-col gap-6 relative z-20 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
            <h2 className="text-lg font-bold text-white-1 border-b border-light-gray-70/20 pb-2">
                {t("projects.entries.new.targetConfiguration.title", "Configuration")}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project Selection */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="project-select" className="text-sm font-bold text-light-gray-70 uppercase tracking-widest pl-1">
                        {t("projects.entries.new.targetConfiguration.targetProject", "Project")}
                    </label>
                    <select
                        id="project-select"
                        value={selectedProjectId}
                        onChange={handleProjectSelectChange}
                        className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-3 text-white-1 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                    >
                        <option value="" disabled>{t("projects.entries.new.targetConfiguration.selectProject", "Select a project...")}</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{t(`projects.${p.name}`, { defaultValue: p.name })}</option>
                        ))}
                    </select>
                </div>

                {/* Social Media Selection */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="platform-select" className="text-sm font-bold text-light-gray-70 uppercase tracking-widest pl-1">
                        {t("projects.entries.new.targetConfiguration.mediaType", "Media Type")}
                    </label>
                    <select
                        id="platform-select"
                        value={selectedPlatform}
                        onChange={(e) => onPlatformChange(e.target.value)}
                        className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-3 text-white-1 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                    >
                        {platforms.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Subproject Selection - Only visible if Project is selected */}
            {selectedProject && (
                <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                    <label className="text-sm font-bold text-light-gray-70 uppercase tracking-widest pl-1">
                        {t("projects.entries.new.targetConfiguration.targetSubprojects", "Subprojects (Models)")}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                        {selectedProject.subprojects.map((sp: { id: number; model: string }) => {
                            const isSelected = selectedSubprojects.includes(sp.model);
                            return (
                                <CustomCheckbox
                                    key={sp.id}
                                    checked={isSelected}
                                    onChange={() => onToggleSubproject(sp.model)}
                                    wrapperClassName="p-4 bg-background-dark/50"
                                    label={t(`projects.models.${sp.model}`)}
                                />
                            );
                        })}
                    </div>
                    {selectedSubprojects.length === 0 && (
                        <p className="text-red-400 text-xs pl-1 font-semibold">{t("projects.entries.new.targetConfiguration.noSubprojectsError", "You must select at least one subproject.")}</p>
                    )}
                </div>
            )}
        </div>
    );
};
