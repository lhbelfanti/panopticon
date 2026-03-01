import { useEffect, useState } from "react";
import { Form, Link, useNavigation, useSubmit } from "react-router";
import type {
  Entry,
  FilterColumn,
  FilterOperator,
  PaginatedEntries,
} from "~/services/api/entries/types";
import type { Project } from "~/services/api/projects/types";
import ConfirmationModal from "~/components/ConfirmationModal";
import {
  ArrowLeft,
  Download,
  Eye,
  FileText,
  Filter,
  Hash,
  Percent,
  Search,
  Trash2,
  Type,
  X,
  Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";
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

  useEffect(() => {
    setCurrFilterCol(filterCol);
  }, [filterCol]);

  const isDeleting = nav.formData?.get("intent") === "delete_entry";
  const isPredicting = nav.formData?.get("intent") === "predict_pending";
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
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const handlePredictPending = () => {
    const formData = new FormData();
    formData.set("intent", "predict_pending");
    submit(formData, { method: "post" });
  };

  return (
    <div className="flex-1 p-6 lg:p-10 overflow-y-auto bg-background-dark min-h-screen custom-scrollbar relative flex flex-col gap-6">
      {/* Header / Breadcrumb */}
      <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <Link
          to={`/projects/${project.id}`}
          className="flex items-center gap-2 text-primary hover:text-white-1 transition-colors text-sm font-semibold max-w-max"
        >
          <ArrowLeft size={16} />
          {t("entries.backToProject")}
        </Link>

        <div>
          <h1 className="text-3xl font-extrabold text-white-1 mb-1 tracking-tight flex items-center gap-3">
            {/* Title should be clickable, go to project screen, hover yellow, text-white-1 */}
            <Link
              to={`/projects/${project.id}`}
              className="text-white-1 hover:text-yellow-400 transition-colors"
            >
              {project.name}
            </Link>
            <span className="opacity-50">/</span>
            <span className="text-primary">
              {t(`projects.models.${modelId}`)}
            </span>
          </h1>
          <p className="text-light-gray-70 text-sm">{t("entries.title")}</p>
        </div>
      </div>

      <div className="bg-surface-dark border border-white/5 rounded-2xl shadow-xl overflow-hidden flex flex-col flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Toolbar Context */}
        <div className="p-4 border-b border-white/5 bg-black/10 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Form
            method="get"
            onChange={(e) => submit(e.currentTarget)}
            className="flex w-full sm:w-auto gap-4 items-center flex-wrap"
          >
            {/* Column Selector */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-light-gray-70 pointer-events-none">
                <Filter size={16} />
              </span>
              <select
                name="filterCol"
                value={currFilterCol}
                onChange={(e) =>
                  setCurrFilterCol(e.target.value as FilterColumn)
                }
                className="appearance-none bg-background-dark border border-white/10 rounded-lg py-2 pl-9 pr-8 text-sm text-white-1 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              >
                <option value="id">ID</option>
                <option value="text">Text</option>
                <option value="verdict">Verdict</option>
                <option value="score">Score</option>
              </select>
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
                  defaultValue={currFilterCol === filterCol ? filterVal : ""}
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
                  defaultValue={currFilterCol === filterCol ? filterVal : ""}
                  placeholder="Search characters"
                  className="w-full bg-background-dark border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white-1 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>
            )}

            {currFilterCol === "verdict" && (
              <div className="relative w-full sm:w-48">
                <select
                  name="filterVal"
                  defaultValue={currFilterCol === filterCol ? filterVal : ""}
                  className="w-full appearance-none bg-background-dark border border-white/10 rounded-lg py-2 px-4 text-sm text-white-1 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                >
                  <option value="">All Verdicts</option>
                  <option value="Positive">Positive</option>
                  <option value="Negative">Negative</option>
                  <option value="Pending">Pending</option>
                  <option value="Error">Error</option>
                </select>
              </div>
            )}

            {currFilterCol === "score" && (
              <div className="flex items-center gap-2">
                <select
                  name="filterOp"
                  defaultValue={currFilterCol === filterCol ? filterOp : ""}
                  className="appearance-none bg-background-dark border border-white/10 rounded-lg py-2 px-3 text-sm text-white-1 focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value=">">&gt;</option>
                  <option value="<">&lt;</option>
                  <option value=">=">&ge;</option>
                  <option value="<=">&le;</option>
                  <option value="=">=</option>
                  <option value="~=">~=</option>
                </select>

                <div className="relative w-24">
                  <input
                    type="number"
                    name="filterVal"
                    defaultValue={currFilterCol === filterCol ? filterVal : ""}
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
                  <div className="relative w-24">
                    <span className="absolute -left-3 text-light-gray-50 top-1/2 -translate-y-1/2 text-xs">
                      ±
                    </span>
                    <input
                      type="number"
                      name="filterBias"
                      defaultValue={
                        currFilterCol === filterCol ? filterBias : "0"
                      }
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

          <a
            href={`/projects/${project.id}/models/${modelId}/export?filterCol=${filterCol}&filterVal=${encodeURIComponent(filterVal)}&filterOp=${encodeURIComponent(filterOp)}&filterBias=${filterBias}`}
            download
            className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-white-1 bg-surface-dark border border-white/10 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap"
          >
            <Download size={16} />
            {t("entries.exportCsv")}
          </a>
        </div>

        {/* Table wrapper */}
        <div className="overflow-x-auto relative flex-1">
          <div
            className={
              "transition-opacity duration-200 " +
              (isSearching ? "opacity-30" : "opacity-100")
            }
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-xs font-bold text-light-gray-70 uppercase tracking-wider bg-black/20 sticky top-0 z-10 backdrop-blur-md">
                  <th className="py-2 pl-6">{t("entries.tableId")}</th>
                  <th className="py-2 px-4">{t("entries.tableText")}</th>
                  <th className="py-2 px-4">{t("entries.tableVerdict")}</th>
                  <th className="py-2 px-4">{t("entries.tableScore")}</th>
                  <th className="py-2 px-4 text-right pr-6">
                    {t("entries.tableActions")}
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
                      {t("entries.noResults")}
                    </td>
                  </tr>
                ) : (
                  data.entries.map((entry: Entry) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-white/5 transition-colors group cursor-pointer"
                      onClick={() => setEntryToView(entry)}
                    >
                      <td className="py-1.5 pl-6 text-xs text-light-gray-50 font-mono whitespace-nowrap">
                        {entry.id.split("_").pop()}
                      </td>
                      <td
                        className="py-1.5 px-4 text-xs text-white-1 max-w-sm truncate"
                        title={entry.text}
                      >
                        {entry.text}
                      </td>
                      <td className="py-1.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 text-[0.65rem] font-bold rounded-full border ${getVerdictStyle(entry.verdict)}`}
                        >
                          {entry.verdict}
                        </span>
                      </td>
                      <td className="py-1.5 px-4 text-xs text-light-gray-80 font-mono whitespace-nowrap">
                        {entry.score != null
                          ? (entry.score * 100).toFixed(1) + "%"
                          : "-"}
                      </td>
                      <td
                        className="py-1.5 px-4 pr-6 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                            title={t("entries.deleteEntry")}
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
        <div className="px-4 lg:px-6 py-3 border-t border-white/5 bg-black/10 flex items-center justify-between">
          {/* Entry Count */}
          <div className="text-xs text-light-gray-70 font-semibold tracking-wide w-1/3">
            Total entries: <span className="text-white-1">{data.total}</span>
          </div>

          {/* Centered Numbered Pagination */}
          <div className="flex gap-1 items-center justify-center w-1/3">
            {Array.from(
              { length: Math.min(5, data.totalPages || 1) },
              (_, i) => {
                // Compute display pages centered around current page
                let pageNum = data.page - 2 + i;
                if (data.page <= 3) pageNum = i + 1;
                else if (data.page >= data.totalPages - 2)
                  pageNum = data.totalPages - 4 + i;

                if (pageNum < 1 || pageNum > data.totalPages) return null;

                return (
                  <Form method="get" key={pageNum} className="inline">
                    <input type="hidden" name="filterCol" value={filterCol} />
                    <input type="hidden" name="filterVal" value={filterVal} />
                    <input type="hidden" name="filterOp" value={filterOp} />
                    <input type="hidden" name="filterBias" value={filterBias} />
                    <input type="hidden" name="page" value={pageNum} />
                    <button
                      type="submit"
                      className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-colors ${
                        pageNum === data.page
                          ? "bg-primary text-background-dark"
                          : "text-light-gray-70 hover:bg-white/5 hover:text-white-1"
                      }`}
                    >
                      {pageNum}
                    </button>
                  </Form>
                );
              },
            )}
          </div>

          {/* Predict Pending Button */}
          <div className="w-1/3 flex justify-end">
            <button
              type="button"
              onClick={handlePredictPending}
              disabled={isPredicting}
              className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-background-dark bg-yellow-400 hover:bg-yellow-500 rounded-md transition-all disabled:opacity-50"
            >
              <Zap size={14} className={isPredicting ? "animate-pulse" : ""} />
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
        title={t("entries.deleteEntry")}
        description={t("entries.deleteEntryDesc")}
        cancelText={t("sidebar.cancel")}
        confirmText={
          isDeleting ? t("common.deleting") : t("entries.deleteEntry")
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
