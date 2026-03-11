import React from "react";
import { X, XSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import EntriesTable from "~/components/EntriesTable";
import type { ExclusionModalProps } from "./types";

export const ExclusionModal = (props: ExclusionModalProps) => {
    const {
        isOpen,
        onClose,
        project,
        modelId,
        entriesData,
        filterCol,
        filterVal,
        filterOp,
        filterBias,
        excludedEntryIds,
        onExcludedIdsChange
    } = props;
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className="absolute inset-x-0 inset-y-0 z-50 pointer-events-none">
            <div className="sticky top-0 w-full h-screen flex items-center justify-center bg-background-dark/80 backdrop-blur-sm p-4 pointer-events-auto animate-in fade-in">
                <div className="bg-surface-dark w-full h-full max-w-7xl max-h-[90vh] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col relative">
                    {/* Modal Header */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20 shrink-0">
                        <div>
                            <h2 className="text-xl font-bold text-white-1 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-bittersweet-shimmer/10 flex items-center justify-center text-bittersweet-shimmer">
                                    <XSquare size={20} />
                                </div>
                                {t("projects.analysis.exclusions.refineTitle")}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 rounded-xl bg-white/5 text-light-gray-70 hover:text-white-1 hover:bg-white/10 transition-all"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Modal Content - The Entries Table */}
                    <div className="flex-1 overflow-hidden flex flex-col bg-background-dark min-h-0">
                        <EntriesTable
                            project={project}
                            modelId={modelId}
                            data={entriesData}
                            filterCol={filterCol}
                            filterVal={filterVal}
                            filterOp={filterOp}
                            filterBias={filterBias}
                            isExclusionOnly={true}
                            excludedIds={new Set(excludedEntryIds)}
                            onExcludedIdsChange={(newSet: Set<string>) => onExcludedIdsChange(Array.from(newSet))}
                        />
                    </div>

                    {/* Modal Footer */}
                    <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end shrink-0">
                        <button
                            onClick={onClose}
                            className="bg-primary hover:bg-primary/90 text-background-dark px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20 cursor-pointer"
                        >
                            {t("projects.analysis.exclusions.applyAndClose")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
