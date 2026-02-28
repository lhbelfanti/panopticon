import { useState } from "react";
import { Form, Link, useNavigation, useSubmit } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Search, Filter, Trash2 } from "lucide-react";
import type { Entry, PaginatedEntries } from "~/services/api/entries/types";
import type { Project } from "~/services/api/projects/types";
import ConfirmationModal from "~/components/ConfirmationModal";

export interface EntriesTableProps {
    project: Project;
    modelId: string;
    data: PaginatedEntries;
    search: string;
    verdict: string;
}

const EntriesTable = (props: EntriesTableProps) => {
    const { project, modelId, data, search, verdict } = props;
    const { t } = useTranslation();
    const submit = useSubmit();
    const nav = useNavigation();

    // Deletion State
    const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
    const isDeleting = nav.formData?.get("intent") === "delete_entry";

    const isSearching = nav.location != null && new URLSearchParams(nav.location.search).has("search");

    const getVerdictStyle = (v: string) => {
        switch (v) {
            case 'Positive': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'Negative': return 'bg-bittersweet-shimmer/10 text-bittersweet-shimmer border-bittersweet-shimmer/20';
            case 'Pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    return (
        <div className="flex-1 p-6 lg:p-10 overflow-y-auto bg-background-dark min-h-screen custom-scrollbar relative flex flex-col gap-6">

            {/* Header / Breadcrumb */}
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Link to={`/projects/${project.id}`} className="flex items-center gap-2 text-primary hover:text-white-1 transition-colors text-sm font-semibold max-w-max">
                    <ArrowLeft size={16} />
                    {t('entries.backToProject')}
                </Link>

                <div>
                    <h1 className="text-3xl font-extrabold text-white-1 mb-1 tracking-tight flex items-center gap-3">
                        <span className="opacity-50">{project.name} /</span>
                        <span className="text-primary">{t(`projects.models.${modelId}`)}</span>
                    </h1>
                    <p className="text-light-gray-70 text-sm">
                        {t('entries.title')}
                    </p>
                </div>
            </div>

            <div className="bg-surface-dark border border-white/5 rounded-2xl shadow-xl overflow-hidden flex flex-col flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Toolbar Context */}
                <div className="p-4 lg:p-6 border-b border-white/5 bg-black/10 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <Form
                        method="get"
                        onChange={(e) => submit(e.currentTarget)}
                        className="flex w-full sm:w-auto gap-4 items-center"
                    >
                        {/* Search Input */}
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-light-gray-70" size={16} />
                            <input
                                type="text"
                                name="search"
                                defaultValue={search}
                                placeholder={t('entries.searchPlaceholder')}
                                className="w-full bg-background-dark border border-white/10 rounded-lg py-2.5 pl-9 pr-4 text-sm text-white-1 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-light-gray-70"
                            />
                        </div>

                        {/* Verdict Dropdown */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-light-gray-70" size={16} />
                            <select
                                name="verdict"
                                defaultValue={verdict}
                                className="appearance-none bg-background-dark border border-white/10 rounded-lg py-2.5 pl-9 pr-8 text-sm text-white-1 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            >
                                <option value="">{t('entries.allVerdicts')}</option>
                                <option value="Positive">Positive</option>
                                <option value="Negative">Negative</option>
                                <option value="Pending">Pending</option>
                                <option value="Error">Error</option>
                            </select>
                        </div>
                    </Form>

                    <a
                        href={`/projects/${project.id}/models/${modelId}/export?search=${encodeURIComponent(search)}&verdict=${encodeURIComponent(verdict)}`}
                        download
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white-1 bg-primary hover:bg-primary/90 rounded-lg transition-colors shadow-primary/20 shadow-lg whitespace-nowrap"
                    >
                        {t('entries.exportCsv')}
                    </a>
                </div>

                {/* Table wrapper */}
                <div className="overflow-x-auto relative min-h-[300px]">
                    <div className={"transition-opacity duration-200 " + (isSearching ? "opacity-30" : "opacity-100")}>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 text-xs font-bold text-light-gray-70 uppercase tracking-wider bg-black/20">
                                    <th className="p-4 pl-6">{t('entries.tableId')}</th>
                                    <th className="p-4">{t('entries.tableText')}</th>
                                    <th className="p-4">{t('entries.tableVerdict')}</th>
                                    <th className="p-4">{t('entries.tableScore')}</th>
                                    <th className="p-4 text-right pr-6">{t('entries.tableActions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {data.entries.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-light-gray-70 border-none">
                                            {t('entries.noResults')}
                                        </td>
                                    </tr>
                                ) : (
                                    data.entries.map((entry: Entry) => (
                                        <tr key={entry.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-4 pl-6 text-sm text-light-gray-50 font-mono">
                                                {entry.id.split('_').pop()}
                                            </td>
                                            <td className="p-4 text-sm text-white-1 max-w-sm truncate" title={entry.text}>
                                                {entry.text}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getVerdictStyle(entry.verdict)}`}>
                                                    {entry.verdict}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-light-gray-80 font-mono">
                                                {entry.score != null ? (entry.score * 100).toFixed(1) + '%' : '-'}
                                            </td>
                                            <td className="p-4 pr-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setEntryToDelete(entry.id)}
                                                        disabled={isDeleting}
                                                        title={t('entries.deleteEntry')}
                                                        className="p-1.5 rounded-md hover:bg-bittersweet-shimmer/20 text-light-gray-50 hover:text-bittersweet-shimmer transition-colors disabled:opacity-50"
                                                    >
                                                        <Trash2 size={16} />
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

                {/* Pagination */}
                <div className="p-4 lg:p-6 border-t border-white/5 bg-black/10 flex items-center justify-between">
                    <span className="text-xs text-light-gray-70 font-semibold uppercase tracking-widest">
                        {t('entries.pageOf', { page: data.page, totalPages: data.totalPages || 1 })}
                    </span>
                    <div className="flex gap-2">
                        <Form method="get" className="inline">
                            {search && <input type="hidden" name="search" value={search} />}
                            {verdict && <input type="hidden" name="verdict" value={verdict} />}
                            <input type="hidden" name="page" value={Math.max(data.page - 1, 1)} />
                            <button
                                type="submit"
                                disabled={data.page <= 1}
                                className="px-4 py-2 text-sm font-bold text-white-1 bg-surface-dark border border-white/10 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-surface-dark transition-colors"
                            >
                                {t('entries.prev')}
                            </button>
                        </Form>
                        <Form method="get" className="inline">
                            {search && <input type="hidden" name="search" value={search} />}
                            {verdict && <input type="hidden" name="verdict" value={verdict} />}
                            <input type="hidden" name="page" value={Math.min(data.page + 1, data.totalPages || 1)} />
                            <button
                                type="submit"
                                disabled={data.page >= data.totalPages}
                                className="px-4 py-2 text-sm font-bold text-white-1 bg-surface-dark border border-white/10 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-surface-dark transition-colors"
                            >
                                {t('entries.next')}
                            </button>
                        </Form>
                    </div>
                </div>

            </div>

            {/* Entry Deletion Modal */}
            <ConfirmationModal
                isOpen={!!entryToDelete}
                onClose={() => setEntryToDelete(null)}
                icon={<Trash2 size={28} />}
                title={t("entries.deleteEntry")}
                description={t("entries.deleteEntryDesc")}
                cancelText={t("sidebar.cancel")}
                confirmText={isDeleting ? t("common.deleting") : t("entries.deleteEntry")}
                confirmAction="."
                confirmMethod="post"
                isDestructive={true}
                hiddenInputs={{ intent: "delete_entry", entryId: entryToDelete || "" }}
            />
        </div>
    );
};

export default EntriesTable;
