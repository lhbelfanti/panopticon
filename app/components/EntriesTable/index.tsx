import { useEffect, useState, useRef } from "react";
import { Form, Link, useNavigation, useSubmit } from "react-router";
import { useTranslation } from "react-i18next";

import ConfirmationModal from "~/components/ConfirmationModal";

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
  Square
} from "lucide-react";

import type {
  Entry,
  FilterColumn,
  PaginatedEntries,
} from "~/services/api/entries/types";
import type { Project } from "~/services/api/projects/types";
import type { EntriesTableProps } from "./types";

const EntriesTable = (props: EntriesTableProps) => {
  const { project, modelId, data, filterCol, filterVal, filterOp, filterBias } =
    props;
  const { t } = useTranslation();
  const submit = useSubmit();
  const nav = useNavigation();

  // Modals & States
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [entryToView, setEntryToView] = useState<Entry | null>(null);

  // Controlled search state for input switching UX
  const [currFilterCol, setCurrFilterCol] = useState<FilterColumn>(filterCol);
  const [localFilterVal, setLocalFilterVal] = useState(filterVal);
  // Exclusion Mode Logic
  const [isExcludeMode, setIsExcludeMode] = useState(false);
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());

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
  const isPredicting = nav.formData?.get("intent") === "predict_pending";

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
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const handlePredictPending = () => {
    const formData = new FormData();
    formData.set("intent", "predict_pending");
    submit(formData, { method: "post" });
  };

  // Convention: extract long Tailwind strings into variables
  const containerClasses =
    "flex-1 p-6 lg:p-10 overflow-y-auto bg-background-dark min-h-screen custom-scrollbar relative flex flex-col gap-6";
  const headerSectionClasses =
    "flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300";
  const tableCardClasses =
    "bg-surface-dark border border-white/5 rounded-2xl shadow-xl overflow-hidden flex flex-col flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500";
  const toolbarClasses =
    "p-4 border-b border-white/5 bg-black/10 flex flex-col sm:flex-row gap-4 justify-between items-center";
  const tableHeaderRowClasses =
    "border-b border-white/5 text-xs font-bold text-light-gray-70 uppercase tracking-wider bg-black/20 sticky top-0 z-10 backdrop-blur-md";
  const predictButtonClasses =
    "flex items-center gap-2 px-6 py-3 text-base font-bold text-background-dark bg-yellow-400 hover:bg-yellow-500 rounded-lg transition-all disabled:opacity-50 hover:scale-105 hover:shadow-lg shadow-yellow-500/20";

  return (
    <div className={containerClasses}>
      {/* Header / Breadcrumb */}
      <div className={headerSectionClasses}>
        <Link
          to={`/projects/${project.id}`}
          className="flex items-center gap-2 text-primary hover:text-white-1 transition-colors text-sm font-semibold max-w-max"
        >
          <ArrowLeft size={16} />
          {t("projects.entries.backToProject")}
        </Link>

        <div>
          <h1 className="text-3xl font-extrabold text-white-1 mb-1 tracking-tight flex items-center gap-3">
            {/* Title should be clickable, go to project screen, hover yellow, text-white-1 */}
            <Link
              to={`/projects/${project.id}`}
              className="text-white-1 hover:text-yellow-400 transition-colors flex items-center gap-2"
            >
              <Folder size={28} className="text-primary" />
              {project.name}
            </Link>
            <span className="opacity-50">/</span>
            <span className="text-primary flex items-center gap-2">
              <Box size={28} />
              {t(`projects.models.${modelId}`)}
            </span>
          </h1>
          <p className="text-light-gray-70 text-sm mt-5">{t("projects.entries.desc")}</p>
        </div>
      </div>

      {/* Analysis Exclusion Banner */}
      {isExcludeMode && (
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <MousePointer2 size={20} />
            </div>
            <div>
              <h3 className="text-white-1 font-bold text-sm">Mode: Exclusion Selection</h3>
              <p className="text-light-gray-60 text-xs mt-0.5">
                Select entries to exclude from the next analysis run. Unchecked entries will be ignored.
                <span className="ml-2 text-primary">({data.total - excludedIds.size} / {data.total} Included)</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setExcludedIds(new Set())}
              className="px-3 py-1.5 text-xs font-bold text-white-1 hover:text-primary transition-colors"
            >
              Reset selection
            </button>
            <Link
              to={`/projects/${project.id}/models/${modelId}/analysis`}
              state={{ excludedEntryIds: Array.from(excludedIds) }}
              className="bg-primary hover:bg-primary/90 text-background-dark px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
            >
              <Zap size={16} />
              Go to Analysis
            </Link>
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
                <option value="id">ID</option>
                <option value="text">Text</option>
                <option value="verdict">Verdict</option>
                <option value="score">Score</option>
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
                  placeholder="Number ID"
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
                  placeholder="Search characters"
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
                  <option value="">All Verdicts</option>
                  <option value="Positive">Positive</option>
                  <option value="Negative">Negative</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Error">Error</option>
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

                {/* Exclude Mode Toggle */}
                <button
                  type="button"
                  onClick={() => setIsExcludeMode(!isExcludeMode)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-bold border transition-all rounded-lg ${isExcludeMode
                    ? "bg-primary text-background-dark border-primary shadow-lg shadow-primary/20"
                    : "bg-surface-dark text-white-1 border-white/10 hover:border-primary/50"
                    }`}
                >
                  {isExcludeMode ? <CheckSquare size={16} /> : <Square size={16} />}
                  Exclude entries
                </button>

                <div className="w-px h-6 bg-white/5 hidden sm:block mx-1" />

                <div className="relative w-40">
                  <input
                    type="number"
                    name="filterVal"
                    value={localFilterVal}
                    onChange={(e) => setLocalFilterVal(e.target.value)}
                    placeholder="0-100"
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
                      placeholder="Bias"
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
            <Link
              to={`/projects/${project.id}/models/${modelId}/analysis`}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white-1 bg-surface-dark border border-white/10 hover:border-primary/50 rounded-lg transition-colors whitespace-nowrap"
            >
              <Zap size={16} className="text-primary" />
              {t("projects.entries.analysis")}
            </Link>

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
              "transition-opacity duration-200 " +
              (nav.state === "loading" ? "opacity-30" : "opacity-100")
            }
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={tableHeaderRowClasses}>
                  {isExcludeMode && (
                    <th className="py-3 px-4 w-1 whitespace-nowrap text-left">
                      <button
                        onClick={() => {
                          if (excludedIds.size > 0) {
                            setExcludedIds(new Set());
                          }
                        }}
                        className="hover:text-primary transition-colors"
                        title="Clear Exclusions"
                      >
                        <CheckSquare size={16} />
                      </button>
                    </th>
                  )}
                  <th className="py-3 px-4 w-1 whitespace-nowrap text-left">{t("projects.entries.tableId")}</th>
                  <th className="py-3 px-4 text-left">{t("projects.entries.tableText")}</th>
                  <th className="py-3 px-4 w-1 whitespace-nowrap text-left">{t("projects.entries.tableVerdict")}</th>
                  <th className="py-3 px-4 w-1 whitespace-nowrap text-left">{t("projects.entries.tableScore")}</th>
                  <th className="py-3 px-4 w-1 whitespace-nowrap text-left">
                    {t("projects.entries.tableActions")}
                  </th>
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
                      {isExcludeMode && (
                        <td
                          className="py-2 px-4 whitespace-nowrap"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newExcluded = new Set(excludedIds);
                            if (newExcluded.has(entry.id)) {
                              newExcluded.delete(entry.id);
                            } else {
                              newExcluded.add(entry.id);
                            }
                            setExcludedIds(newExcluded);
                          }}
                        >
                          <div className="flex items-center justify-center">
                            {!excludedIds.has(entry.id) ? (
                              <CheckSquare size={18} className="text-primary" />
                            ) : (
                              <Square size={18} className="text-light-gray-50 opacity-40" />
                            )}
                          </div>
                        </td>
                      )}
                      <td className="py-2 px-4 text-sm text-light-gray-50 font-mono whitespace-nowrap text-left">
                        {entry.id.split("_")[1] || entry.id}
                      </td>
                      <td
                        className="py-2 px-4 text-sm text-white-1 truncate max-w-sm text-left leading-relaxed"
                        title={entry.text}
                      >
                        {entry.text}
                      </td>
                      <td className="py-2 px-4 whitespace-nowrap text-left">
                        <span
                          className={`px-2 py-0.5 text-[0.65rem] font-bold rounded-full border ${getVerdictStyle(entry.verdict)}`}
                        >
                          {entry.verdict}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-sm text-light-gray-80 font-mono whitespace-nowrap text-left">
                        {entry.score != null
                          ? (entry.score * 100).toFixed(1) + "%"
                          : "-"}
                      </td>
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
                            title="View full entry"
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Toolbar: Count, Pagination, Predict Button */}
        <div className="px-6 py-6 border-t border-white/5 bg-black/10 flex items-center justify-between">
          {/* Entry Count */}
          <div className="text-sm text-light-gray-70 font-bold tracking-wide w-1/4">
            {t("projects.entries.datasetEntries")}: <span className="text-white-1 text-xl ml-1">{data.total}</span>
          </div>

          {/* Complex Pagination */}
          <div className="flex gap-2 items-center justify-center w-2/4">
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

          {/* Predict Pending Button */}
          <div className="w-1/4 flex justify-end">
            <button
              type="button"
              onClick={handlePredictPending}
              disabled={isPredicting}
              className={predictButtonClasses}
            >
              <Zap size={20} className={isPredicting ? "animate-pulse" : ""} />
              {isPredicting ? "Predicting..." : "Predict Pending"}
            </button>
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
                View Full Entry
              </h3>
              <button
                onClick={() => setEntryToView(null)}
                className="p-1.5 rounded-lg text-light-gray-70 hover:text-white-1 hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-background-dark border border-white/5 rounded-xl p-4 max-h-[60vh] overflow-y-auto w-full text-light-gray-80 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                {entryToView.text}
              </div>
              <div className="flex gap-4 mt-6 items-center">
                <span className="text-xs text-light-gray-70 uppercase tracking-widest font-bold">
                  Verdict:
                </span>
                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded-full border ${getVerdictStyle(entryToView.verdict)}`}
                >
                  {entryToView.verdict}
                </span>

                {entryToView.score !== undefined && (
                  <>
                    <div className="w-px h-4 bg-white/10 mx-2" />
                    <span className="text-xs text-light-gray-70 uppercase tracking-widest font-bold">
                      Score:
                    </span>
                    <span className="text-xs text-light-gray-80 font-mono">
                      {(entryToView.score * 100).toFixed(2)}%
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Entry Deletion Modal */}
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
    </div>
  );
};

export default EntriesTable;
