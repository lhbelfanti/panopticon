import { useEffect, useState, useRef } from "react";
import { Form, Link, useNavigation, useSubmit } from "react-router";
import { useTranslation } from "react-i18next";

import ConfirmationModal from "~/components/ConfirmationModal";
import { TweetCard } from "~/components/EntryIngestion/TweetCard";
import { PredictionsHistoryModal } from "~/components/Modals/PredictionsHistoryModal";

import {
  ArrowLeft,
  Box,
  ChevronDown,
  Download,
  Eye,
  FileText,
  Filter,
  Folder,
  Hash,
  Percent,
  Search,
  Trash2,
  X,
  Zap,
  MousePointer2,
  CheckSquare,
  Square,
  History
} from "lucide-react";

import type {
  Entry,
  FilterColumn,
  PaginatedEntries,
} from "~/services/api/entries/types";
import type { Project } from "~/services/api/projects/types";
import type { EntriesTableProps } from "./types";

const EntriesTable = (props: EntriesTableProps) => {
  const {
    project,
    modelId,
    data,
    filterCol,
    filterVal,
    filterOp,
    filterBias,
    isExclusionOnly = false,
    excludedIds: externalExcludedIds,
    onExcludedIdsChange,
  } = props;
  const { t } = useTranslation();
  const submit = useSubmit();
  const nav = useNavigation();

  // Modals & States
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [entryToView, setEntryToView] = useState<Entry | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Controlled search state for input switching UX
  const [currFilterCol, setCurrFilterCol] = useState<FilterColumn>(filterCol);
  const [localFilterVal, setLocalFilterVal] = useState(filterVal);
  // -- Selection State Logic --
  const [internalExcludedIds, setInternalExcludedIds] = useState<Set<string>>(new Set());

  // Use external state if provided, otherwise fallback to local
  const excludedIds = externalExcludedIds || internalExcludedIds;
  const setExcludedIds = (newIds: Set<string>) => {
    if (onExcludedIdsChange) {
      onExcludedIdsChange(newIds);
    } else {
      setInternalExcludedIds(newIds);
    }
  };

  // Exclusion Mode Logic
  const [isExcludeMode, setIsExcludeMode] = useState(isExclusionOnly);

  // Prediction Selection Mode Logic
  const [isPredictSelectionMode, setIsPredictSelectionMode] = useState(false);
  const [selectedPredictionIds, setSelectedPredictionIds] = useState<Set<string>>(new Set());

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setCurrFilterCol(filterCol);
    setLocalFilterVal(filterVal);
  }, [filterCol, filterVal]);

  // Debounce logic for typing in text fields
  useEffect(() => {
    if (localFilterVal !== filterVal) {
      const handler = setTimeout(() => {
        if (formRef.current) submit(formRef.current, { replace: true });
      }, 300);
      return () => clearTimeout(handler);
    }
  }, [localFilterVal, submit, filterVal]);

  const isDeleting = nav.formData?.get("intent") === "delete_entry";
  const isPredicting = nav.formData?.get("intent") === "predict_pending" || nav.formData?.get("intent") === "predict_selected";

  useEffect(() => {
    if (nav.state === "idle" && !isDeleting) {
      setEntryToDelete(null);
    }
  }, [nav.state, isDeleting]);

  const isSearching =
    nav.location != null &&
    new URLSearchParams(nav.location.search).has("filterCol");

  const getVerdictStyle = (v: string) => {
    switch (v) {
      case "Positive":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "Negative":
        return "bg-bittersweet-shimmer/10 text-bittersweet-shimmer border-bittersweet-shimmer/20";
      case "Pending":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "In Progress":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Error":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const handlePredictPending = () => {
    const formData = new FormData();
    formData.set("intent", "predict_pending");
    submit(formData, { method: "post" });
  };

  const handlePredictSelected = () => {
    const formData = new FormData();
    formData.set("intent", "predict_selected");
    formData.set("entryIds", JSON.stringify(Array.from(selectedPredictionIds)));
    submit(formData, { method: "post" });
    setIsPredictSelectionMode(false);
    setSelectedPredictionIds(new Set());
  };

  // Convention: extract long Tailwind strings into variables
  const containerClasses = isExclusionOnly
    ? "flex flex-col flex-1 gap-6 relative px-2 pb-4 overflow-hidden"
    : `relative flex flex-col gap-6 ${isExclusionOnly ? "flex-1" : ""}`;

  const headerSectionClasses =
    "flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300";
  const tableCardClasses = `bg-surface-dark border border-white/5 rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 ${isExclusionOnly ? "flex-1" : ""}`;
  const toolbarClasses =
    "p-4 border-b border-white/5 bg-black/10 flex flex-col sm:flex-row gap-4 justify-between items-center";
  const tableHeaderRowClasses =
    "border-b border-white/5 text-xs font-bold text-light-gray-70 uppercase tracking-wider bg-black/20 sticky top-0 z-10 backdrop-blur-md";
  const predictButtonClasses =
    "flex items-center gap-2 px-6 py-3 text-base font-bold text-background-dark bg-yellow-400 hover:bg-yellow-500 rounded-lg transition-all disabled:opacity-50 hover:scale-105 hover:shadow-lg shadow-yellow-500/20";

  return (
    <div className={containerClasses}>
      {/* Analysis Exclusion Banner */}
      {isExcludeMode && (
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <MousePointer2 size={20} />
            </div>
            <div>
              <h3 className="text-white-1 font-bold text-sm">{t("projects.entries.excludeEntries", "Exclude entries")}</h3>
              <p className="text-light-gray-60 text-xs mt-0.5">
                {t("projects.entries.excludeEntriesDesc", "Select entries for the next analysis run. Unchecked entries will be excluded.")}
                <span className="ml-2 text-primary">{t("projects.entries.includedCount", { count: data.total - excludedIds.size, total: data.total, defaultValue: "({{count}} / {{total}} Included)" })}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setExcludedIds(new Set())}
              className="px-3 py-1.5 text-xs font-bold text-white-1 hover:text-primary transition-colors"
            >
              {t("projects.entries.resetSelection", "Reset selection")}
            </button>
          </div>
        </div>
      )}

      {/* Prediction Selection Banner */}
      {isPredictSelectionMode && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400">
              <MousePointer2 size={20} />
            </div>
            <div>
              <h3 className="text-white-1 font-bold text-sm">{t("projects.entries.selectForPrediction")}</h3>
              <p className="text-light-gray-60 text-xs mt-0.5">
                {t("projects.entries.selectForPredictionDesc")}
                <span className="ml-2 text-yellow-400">{t("projects.entries.selectedCount", { count: selectedPredictionIds.size })}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedPredictionIds(new Set())}
              className="px-3 py-1.5 text-xs font-bold text-white-1 hover:text-yellow-400 transition-colors"
            >
              {t("projects.entries.resetSelection", "Reset selection")}
            </button>
          </div>
        </div>
      )}

      <div className={tableCardClasses}>
        {/* Toolbar Context */}
        <div className={toolbarClasses}>
          <Form
            ref={formRef}
            method="get"
            onChange={(e) => {
              // We rely on the local state + debounce for text inputs,
              // but for select dropdowns, form native logic should submit directly:
              if (
                e.target instanceof HTMLSelectElement ||
                (e.target instanceof HTMLInputElement && e.target.type !== "text" && e.target.type !== "number")
              ) {
                submit(e.currentTarget, { replace: true });
              }
            }}
            onSubmit={(e) => { e.preventDefault(); submit(e.currentTarget, { replace: true }); }}
            className="flex w-full sm:w-auto gap-4 items-center flex-wrap"
          >
            {/* Column Selector */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-light-gray-70 pointer-events-none z-10">
                <Filter size={16} />
              </span>
              <select
                name="filterCol"
                value={currFilterCol}
                onChange={(e) => {
                  setCurrFilterCol(e.target.value as FilterColumn);
                  setLocalFilterVal("");
                }}
                className="appearance-none bg-background-dark border border-white/10 rounded-lg py-2 pl-9 pr-8 text-sm text-white-1 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              >
                <option value="id">{t("projects.entries.tableId")}</option>
                <option value="text">{t("projects.entries.tableText")}</option>
                <option value="verdict">{t("projects.entries.tableVerdict")}</option>
                <option value="score">{t("projects.entries.tableScore")}</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-light-gray-70 pointer-events-none" />
            </div>

            {/* Dynamic Value Input */}
            {currFilterCol === "id" && (
              <div className="relative w-full sm:w-48">
                <Hash
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-light-gray-70"
                  size={16}
                />
                <input
                  type="number"
                  name="filterVal"
                  value={localFilterVal}
                  onChange={(e) => setLocalFilterVal(e.target.value)}
                  placeholder={t("projects.entries.numberIdPlaceholder")}
                  className="w-full bg-background-dark border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white-1 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>
            )}

            {currFilterCol === "text" && (
              <div className="relative w-full sm:w-64">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-light-gray-70"
                  size={16}
                />
                <input
                  type="text"
                  name="filterVal"
                  value={localFilterVal}
                  onChange={(e) => setLocalFilterVal(e.target.value)}
                  placeholder={t("projects.entries.searchCharactersPlaceholder")}
                  className="w-full bg-background-dark border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white-1 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>
            )}

            {currFilterCol === "verdict" && (
              <div className="relative w-full sm:w-48">
                <select
                  name="filterVal"
                  value={localFilterVal}
                  onChange={(e) => setLocalFilterVal(e.target.value)}
                  className="w-full appearance-none bg-background-dark border border-white/10 rounded-lg py-2 px-4 pr-8 text-sm text-white-1 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                >
                  <option value="">{t("projects.entries.allVerdicts")}</option>
                  <option value="Positive">{t("projects.entries.verdicts.positive")}</option>
                  <option value="Negative">{t("projects.entries.verdicts.negative")}</option>
                  <option value="Pending">{t("projects.entries.verdicts.pending")}</option>
                  <option value="In Progress">{t("projects.entries.verdicts.inProgress")}</option>
                  <option value="Error">{t("projects.entries.verdicts.error")}</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-light-gray-70 pointer-events-none" />
              </div>
            )}

            {currFilterCol === "score" && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    name="filterOp"
                    defaultValue={filterOp}
                    className="appearance-none bg-background-dark border border-white/10 rounded-lg py-2 pl-3 pr-8 text-sm text-white-1 focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value=">">&gt;</option>
                    <option value="<">&lt;</option>
                    <option value=">=">&ge;</option>
                    <option value="<=">&le;</option>
                    <option value="=">=</option>
                    <option value="~=">~=</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-light-gray-70 pointer-events-none" />
                </div>

                <div className="relative w-40">
                  <input
                    type="number"
                    name="filterVal"
                    value={localFilterVal}
                    onChange={(e) => setLocalFilterVal(e.target.value)}
                    placeholder={t("projects.entries.scorePlaceholder")}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full bg-background-dark border border-white/10 rounded-lg py-2 pl-3 pr-8 text-sm text-white-1 focus:ring-2 focus:ring-primary outline-none"
                  />
                  <Percent
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-light-gray-70"
                    size={14}
                  />
                </div>

                {filterOp === "~=" && (
                  <div className="relative w-32 ml-2">
                    <span className="absolute -left-3 text-light-gray-50 top-1/2 -translate-y-1/2 text-xs">
                      ±
                    </span>
                    <input
                      type="number"
                      name="filterBias"
                      defaultValue={filterBias}
                      placeholder={t("projects.entries.biasPlaceholder")}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full bg-background-dark border border-white/10 rounded-lg py-2 px-3 text-sm text-white-1 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                )}
              </div>
            )}
          </Form>

          <div className="flex items-center gap-3">
            {!isExclusionOnly && (
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-light-gray-70 bg-surface-dark border border-white/10 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap"
              >
                <History size={16} />
                {t("projects.entries.predictionHistory")}
              </button>
            )}

            {!isExclusionOnly && (
              <Link
                to={`/projects/${project.id}/models/${modelId}/analysis`}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white-1 bg-surface-dark border border-white/10 hover:border-primary/50 rounded-lg transition-colors whitespace-nowrap"
              >
                <Zap size={16} className="text-primary" />
                {t("projects.entries.analysis")}
              </Link>
            )}



            <a
              href={`/projects/${project.id}/models/${modelId}/export?filterCol=${filterCol}&filterVal=${encodeURIComponent(filterVal)}&filterOp=${encodeURIComponent(filterOp)}&filterBias=${filterBias}`}
              download
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white-1 bg-surface-dark border border-white/10 hover:bg-yellow-400 hover:text-background-dark hover:border-yellow-400 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download size={16} />
              {t("projects.entries.exportCsv")}
            </a>
          </div>
        </div>

        {/* Table wrapper */}
        <div className="overflow-x-auto relative flex-1">
          <div
            className={
              "flex flex-col flex-1 transition-opacity duration-200 " +
              (nav.state === "loading" ? "opacity-30" : "opacity-100")
            }
          >
            {(isExcludeMode || isPredictSelectionMode) && data.entries.length > 0 && (
              <div className="bg-white/5 border-b border-white/5 px-4 py-3 flex items-center justify-start">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (isExcludeMode) {
                        const allIdsOnPage = data.entries.map(e => e.id);
                        const areAllSelected = !allIdsOnPage.some(id => excludedIds.has(id));
                        const newExcluded = new Set(excludedIds);
                        if (areAllSelected) {
                          allIdsOnPage.forEach(id => newExcluded.add(id));
                        } else {
                          allIdsOnPage.forEach(id => newExcluded.delete(id));
                        }
                        setExcludedIds(newExcluded);
                      } else {
                        const pendingOnPage = data.entries.filter(e => e.verdict === "Pending").map(e => e.id);
                        if (pendingOnPage.length === 0) return;
                        const areAllPendingSelected = pendingOnPage.every(id => selectedPredictionIds.has(id));
                        const newSelected = new Set(selectedPredictionIds);
                        if (areAllPendingSelected) {
                          pendingOnPage.forEach(id => newSelected.delete(id));
                        } else {
                          pendingOnPage.forEach(id => newSelected.add(id));
                        }
                        setSelectedPredictionIds(newSelected);
                      }
                    }}
                    className="hover:text-primary transition-colors flex items-center justify-center p-1 rounded hover:bg-white/5"
                    title={
                      isExcludeMode
                        ? !data.entries.some(e => excludedIds.has(e.id)) ? t("projects.entries.deselectPage") : t("projects.entries.selectPage")
                        : data.entries.filter(e => e.verdict === "Pending").length > 0 && data.entries.filter(e => e.verdict === "Pending").every(e => selectedPredictionIds.has(e.id)) ? t("projects.entries.deselectPage") : t("projects.entries.selectPage")
                    }
                  >
                    {isExcludeMode ? (
                      !data.entries.some(e => excludedIds.has(e.id)) ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} className="text-light-gray-50 opacity-40" />
                    ) : (
                      data.entries.filter(e => e.verdict === "Pending").length > 0 && data.entries.filter(e => e.verdict === "Pending").every(e => selectedPredictionIds.has(e.id)) ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} className="text-light-gray-50 opacity-40" />
                    )}
                  </button>
                  <span className="text-sm font-bold text-white-1">{t("projects.entries.selectAll")}</span>
                </div>
              </div>
            )}
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={tableHeaderRowClasses}>
                  {(isExcludeMode || isPredictSelectionMode) && (
                    <th className="py-3 px-4 whitespace-nowrap text-left w-1">
                      <span className="font-bold">{t("projects.entries.selectedLabel")}</span>
                    </th>
                  )}
                  <th className="py-3 px-4 w-1 whitespace-nowrap text-left">{t("projects.entries.tableId")}</th>
                  <th className="py-3 px-4 text-left">{t("projects.entries.tableText")}</th>
                  <th className="py-3 px-4 w-1 whitespace-nowrap text-left">{t("projects.entries.tableVerdict")}</th>
                  <th className="py-3 px-4 w-1 whitespace-nowrap text-left">{t("projects.entries.tableScore")}</th>
                  {(!isExclusionOnly) && (
                    <th className="py-3 px-4 w-1 whitespace-nowrap text-left">
                      {t("projects.entries.tableActions")}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.entries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-12 text-center text-light-gray-70 border-none"
                    >
                      {t("projects.entries.noResults")}
                    </td>
                  </tr>
                ) : (
                  data.entries.map((entry: Entry) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-white/5 transition-colors group cursor-pointer"
                      onClick={() => setEntryToView(entry)}
                    >
                      {(isExcludeMode || isPredictSelectionMode) && (
                        <td
                          className="py-2 px-4 whitespace-nowrap"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isExcludeMode) {
                              const newExcluded = new Set(excludedIds);
                              if (newExcluded.has(entry.id)) {
                                newExcluded.delete(entry.id);
                              } else {
                                newExcluded.add(entry.id);
                              }
                              setExcludedIds(newExcluded);
                            } else {
                              if (entry.verdict !== "Pending") return;
                              const newSelected = new Set(selectedPredictionIds);
                              if (newSelected.has(entry.id)) {
                                newSelected.delete(entry.id);
                              } else {
                                newSelected.add(entry.id);
                              }
                              setSelectedPredictionIds(newSelected);
                            }
                          }}
                        >
                          <div className="flex items-center justify-start">
                            {isExcludeMode ? (
                              !excludedIds.has(entry.id) ? (
                                <CheckSquare size={18} className="text-primary" />
                              ) : (
                                <Square size={18} className="text-light-gray-50 opacity-40" />
                              )
                            ) : (
                              entry.verdict === "Pending" ? (
                                selectedPredictionIds.has(entry.id) ? (
                                  <CheckSquare size={18} className="text-primary" />
                                ) : (
                                  <Square size={18} className="text-light-gray-50 opacity-40" />
                                )
                              ) : (
                                <Square size={18} className="text-light-gray-50 opacity-10 cursor-not-allowed" />
                              )
                            )}
                          </div>
                        </td>
                      )}
                      <td className="py-2 px-4 text-sm text-light-gray-50 font-mono whitespace-nowrap text-left">
                        {entry.id.split("_")[1] || entry.id}
                      </td>
                      <td
                        className="py-2 px-4 text-sm text-white-1 max-w-sm text-left leading-relaxed"
                        title={entry.text}
                      >
                        <div className="truncate">{entry.text}</div>
                        {entry.metadata && (entry.metadata.isReply || entry.metadata.hasQuote || entry.metadata.isQuoteAReply) && (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {entry.metadata.isReply && (
                              <span className="px-1.5 py-0.5 text-[0.6rem] font-bold tracking-wider rounded bg-primary/10 text-primary uppercase">
                                {t("projects.entries.metadataReply", "Is a reply")}
                              </span>
                            )}
                            {entry.metadata.hasQuote && (
                              <span className="px-1.5 py-0.5 text-[0.6rem] font-bold tracking-wider rounded bg-yellow-500/10 text-yellow-500 uppercase">
                                {t("projects.entries.metadataQuote", "Has quote")}
                              </span>
                            )}
                            {entry.metadata.isQuoteAReply && (
                              <span className="px-1.5 py-0.5 text-[0.6rem] font-bold tracking-wider rounded bg-blue-500/10 text-blue-400 uppercase">
                                {t("projects.entries.metadataQuoteIsReply", "Quote is a reply")}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-4 whitespace-nowrap text-left">
                        <span
                          className={`px-2 py-0.5 text-[0.65rem] font-bold rounded-full border ${getVerdictStyle(entry.verdict)}`}
                        >
                          {t(`projects.entries.verdicts.${entry.verdict.toLowerCase().replace(" ", "")}`, entry.verdict)}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-sm text-light-gray-80 font-mono whitespace-nowrap text-left">
                        {entry.score != null
                          ? (entry.score * 100).toFixed(1) + "%"
                          : "-"}
                      </td>
                      {(!isExclusionOnly) && (
                        <td
                          className="py-2 px-4 text-left whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-start gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEntryToView(entry);
                              }}
                              title={t("projects.entries.viewEntry", "View full entry")}
                              className="p-1.5 rounded-full hover:bg-blue-500/20 hover:scale-105 text-light-gray-50 hover:text-blue-400 transition-all"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEntryToDelete(entry.id);
                              }}
                              disabled={isDeleting}
                              title={t("projects.entries.deleteEntry")}
                              className="group p-1.5 rounded-full hover:bg-bittersweet-shimmer hover:scale-105 text-light-gray-50 hover:text-white-1 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-transparent"
                            >
                              <Trash2
                                size={16}
                                className="group-hover:text-white-1"
                              />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Toolbar: Count, Pagination, Predict Button */}
        <div className="px-6 py-6 border-t border-white/5 bg-black/10 flex items-center justify-between relative">
          {/* Entry Count */}
          <div className="flex flex-col absolute left-6">
            <div className="text-sm text-light-gray-70 font-bold tracking-wide">
              {data.total !== data.datasetTotal ? (
                <>
                  {t("projects.entries.filteredEntries", { total: data.datasetTotal })}: <span className="text-white-1 text-xl ml-1">{data.total}</span>
                </>
              ) : (
                <>
                  {t("projects.entries.datasetEntries")}: <span className="text-white-1 text-xl ml-1">{data.datasetTotal}</span>
                </>
              )}
            </div>
            {data.totalPending > 0 && (
              <div className="text-sm text-light-gray-70 font-bold tracking-wide mt-1">
                {t("projects.entries.pendingToPredict")}: <span className="text-white-1 text-xl ml-1">{data.totalPending}</span>
              </div>
            )}
          </div>

          {/* Complex Pagination - Centered */}
          <div className="flex gap-2 items-center justify-center w-full">
            <Form method="get" className="inline">
              <input type="hidden" name="filterCol" value={filterCol} />
              <input type="hidden" name="filterVal" value={filterVal} />
              <input type="hidden" name="filterOp" value={filterOp} />
              <input type="hidden" name="filterBias" value={filterBias} />
              <input type="hidden" name="page" value={Math.max(1, data.page - 1)} />
              <button
                type="submit"
                disabled={data.page <= 1}
                title={t("projects.entries.prev")}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-lg font-bold transition-colors text-light-gray-70 hover:bg-white/5 hover:text-white-1 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                &lt;
              </button>
            </Form>

            <div className="flex gap-1 items-center bg-white/5 rounded-lg px-2 py-1">
              {(() => {
                const total = data.totalPages || 1;
                const current = data.page;

                // Logic to display pages with ellipsis
                const pages: (number | string)[] = [];
                if (total <= 10) {
                  for (let i = 1; i <= total; i++) pages.push(i);
                } else {
                  if (current <= 4) {
                    pages.push(1, 2, 3, 4, 5, "...", total - 2, total - 1, total);
                  } else if (current >= total - 3) {
                    pages.push(1, 2, 3, "...", total - 4, total - 3, total - 2, total - 1, total);
                  } else {
                    pages.push(1, 2, "...", current - 1, current, current + 1, "...", total - 1, total);
                  }
                }

                return pages.map((p, idx) => {
                  if (p === "...") {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-2 text-light-gray-70 text-sm font-bold opacity-50">
                        ...
                      </span>
                    );
                  }

                  return (
                    <Form method="get" key={p} className="inline">
                      <input type="hidden" name="filterCol" value={filterCol} />
                      <input type="hidden" name="filterVal" value={filterVal} />
                      <input type="hidden" name="filterOp" value={filterOp} />
                      <input type="hidden" name="filterBias" value={filterBias} />
                      <input type="hidden" name="page" value={p} />
                      <button
                        type="submit"
                        className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-bold transition-colors ${p === current
                          ? "bg-primary text-background-dark shadow-md"
                          : "text-light-gray-70 hover:bg-white/10 hover:text-white-1"
                          }`}
                      >
                        {p}
                      </button>
                    </Form>
                  );
                });
              })()}
            </div>

            <Form method="get" className="inline">
              <input type="hidden" name="filterCol" value={filterCol} />
              <input type="hidden" name="filterVal" value={filterVal} />
              <input type="hidden" name="filterOp" value={filterOp} />
              <input type="hidden" name="filterBias" value={filterBias} />
              <input type="hidden" name="page" value={Math.min(data.totalPages, data.page + 1)} />
              <button
                type="submit"
                disabled={data.page >= data.totalPages}
                title={t("projects.entries.next")}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-lg font-bold transition-colors text-light-gray-70 hover:bg-white/5 hover:text-white-1 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                &gt;
              </button>
            </Form>
          </div>

          {/* Predict Pending Button - Absolute Right */}
          <div className="absolute right-6 flex items-center gap-2">
            {!isExclusionOnly && data.totalPending > 0 && !isPredictSelectionMode && (
              <>
                {data.entries.some((e) => e.verdict === "Pending") && (
                  <button
                    type="button"
                    onClick={() => setIsPredictSelectionMode(true)}
                    className="px-4 py-2 text-sm font-bold text-light-gray-70 bg-surface-dark border border-white/10 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {t("projects.entries.selectToPredict")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handlePredictPending}
                  disabled={isPredicting}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-background-dark bg-yellow-400 hover:bg-yellow-500 rounded-lg transition-all disabled:opacity-50 hover:scale-105 hover:shadow-lg shadow-yellow-500/20"
                >
                  <Zap size={16} className={isPredicting ? "animate-pulse" : ""} />
                  {isPredicting ? t("projects.entries.predicting") : t("projects.entries.predictPending")}
                </button>
              </>
            )}

            {!isExclusionOnly && isPredictSelectionMode && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsPredictSelectionMode(false);
                    setSelectedPredictionIds(new Set());
                  }}
                  className="px-4 py-2 text-sm font-bold text-light-gray-70 bg-surface-dark border border-white/10 hover:bg-white/5 rounded-lg transition-colors"
                >
                  {t("sidebar.cancel")}
                </button>
                <button
                  type="button"
                  onClick={handlePredictSelected}
                  disabled={isPredicting || selectedPredictionIds.size === 0}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-background-dark bg-yellow-400 hover:bg-yellow-500 rounded-lg transition-all disabled:opacity-50 hover:scale-105 hover:shadow-lg shadow-yellow-500/20"
                >
                  <Zap size={16} className={isPredicting ? "animate-pulse" : ""} />
                  {isPredicting ? t("projects.entries.predicting") : t("projects.entries.predictSelected")}
                  {selectedPredictionIds.size > 0 && ` (${selectedPredictionIds.size})`}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* View Full Entry Modal */}
      {entryToView && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setEntryToView(null)}
        >
          <div
            className="bg-surface-dark w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
              <h3 className="text-sm font-bold text-white-1 uppercase tracking-widest flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                {t("projects.entries.viewFullEntry")}
              </h3>
              <button
                onClick={() => setEntryToView(null)}
                className="p-1.5 rounded-lg text-light-gray-70 hover:text-white-1 hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto w-full custom-scrollbar">
              <TweetCard
                mode="readOnly"
                initialData={{
                  text: entryToView.text,
                  metadata: entryToView.metadata || {
                    isReply: false,
                    hasQuote: false,
                    isQuoteAReply: false,
                    quotedText: ""
                  }
                }}
              />
              <div className="flex justify-center gap-4 mt-8 items-center bg-background-dark/50 border border-white/5 py-3 px-6 rounded-full w-max mx-auto shadow-inner">
                <span className="text-xs text-light-gray-70 uppercase tracking-widest font-bold">
                  {t("projects.entries.verdict")}:
                </span>
                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded-full border ${getVerdictStyle(entryToView.verdict)}`}
                >
                  {t(`projects.entries.verdicts.${entryToView.verdict.toLowerCase().replace(" ", "")}`, entryToView.verdict)}
                </span>

                {entryToView.score !== undefined && (
                  <>
                    <div className="w-px h-4 bg-white/10 mx-2" />
                    <span className="text-xs text-light-gray-70 uppercase tracking-widest font-bold">
                      {t("projects.entries.score")}:
                    </span>
                    <span className="text-sm font-bold text-white-1 font-mono">
                      {(entryToView.score * 100).toFixed(2)}%
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!entryToDelete}
        onClose={() => setEntryToDelete(null)}
        icon={<Trash2 size={28} />}
        title={t("projects.entries.deleteEntry")}
        description={t("projects.entries.deleteEntryDesc")}
        cancelText={t("sidebar.cancel")}
        confirmText={
          isDeleting ? t("common.deleting") : t("projects.entries.deleteEntry")
        }
        confirmAction="."
        confirmMethod="post"
        isDestructive={true}
        hiddenInputs={{ intent: "delete_entry", entryId: entryToDelete || "" }}
      />
      {isHistoryModalOpen && (
        <PredictionsHistoryModal projectId={project.id} modelId={modelId} onClose={() => setIsHistoryModalOpen(false)} />
      )}
    </div>
  );
};

export default EntriesTable;
