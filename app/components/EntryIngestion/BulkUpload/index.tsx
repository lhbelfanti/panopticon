import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, DownloadCloud, TableProperties, Trash2 } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";
import type { BulkUploadProps } from "./types";

export const BulkUpload = (props: BulkUploadProps) => {
    const { onUpload, isSubmitting, socialMediaType = "generic" } = props;
    const { t } = useTranslation();
    const [file, setFile] = useState<File | null>(null);
    const [parsedEntries, setParsedEntries] = useState<any[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const XLogo = () => (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
            <g>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
            </g>
        </svg>
    );

    const isTwitter = socialMediaType === "twitter";

    // Expected required headers based on type
    const expectedHeaders = isTwitter
        ? ["text", "date", "is_reply", "has_quote", "quoted_text", "is_quote_a_reply"]
        : ["text"];

    const processFile = async (selectedFile: File) => {
        setError(null);
        setParsedEntries(null);
        setFile(selectedFile);

        if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
            setError(t("projects.entries.new.errorInvalidCsv", "Invalid file. Please upload a .csv file."));
            return;
        }

        try {
            const entries = await parseCsv(selectedFile);
            if (entries.length === 0) {
                setError(t("projects.entries.new.errorEmptyCsv"));
                return;
            }
            setParsedEntries(entries);
        } catch (err: any) {
            setError(err.message || t("projects.entries.new.errorReadFailed"));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            processFile(droppedFile);
        }
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);
    };

    const generateTemplate = () => {
        const header = expectedHeaders.join(",");
        let mockRow = "";
        if (isTwitter) {
            mockRow = '"This is a sample entry","2026-01-01T10:00:00",false,true,"This is a quoted entry",false';
        } else {
            mockRow = '"This is a sample entry"';
        }

        const csvContent = "data:text/csv;charset=utf-8," + header + "\n" + mockRow + "\n";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", isTwitter ? "x_template.csv" : `template_${socialMediaType}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const parseCsv = async (file: File): Promise<{ text: string; metadata?: any }[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const textResult = e.target?.result as string;
                // Simple regex to split by comma, respecting quotes
                const lines = textResult.split(/\r?\n/);

                if (lines.length < 2) {
                    reject(new Error(t("projects.entries.new.errorEmptyRows")));
                    return;
                }

                // parse header
                const headerLine = lines[0].toLowerCase();
                // Simple CSV parse for headers
                const splitRowRegex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
                const headers = headerLine.split(splitRowRegex).map(h => h.replace(/^"|"$/g, '').trim());

                const textIndex = headers.indexOf("text");
                if (textIndex === -1) {
                    reject(new Error(t("projects.entries.new.errorNoTextColumn")));
                    return;
                }

                const entries: { text: string; metadata?: any }[] = [];

                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    const columns = line.split(splitRowRegex).map(col => col.replace(/^"|"$/g, '').trim());
                    const txt = columns[textIndex];

                    if (!txt) {
                        reject(new Error(t("projects.entries.new.errorMissingTextField", { row: i + 1 })));
                        return;
                    }

                    let metadata: any = undefined;

                    if (isTwitter) {
                        const getBool = (colName: string) => {
                            const idx = headers.indexOf(colName);
                            if (idx === -1 || !columns[idx]) return false;
                            const val = columns[idx].toLowerCase();
                            return val === 'true' || val === '1' || val === 'yes';
                        };
                        const getString = (colName: string) => {
                            const idx = headers.indexOf(colName);
                            if (idx === -1) return undefined;
                            return columns[idx];
                        };

                        metadata = {
                            date: getString("date"),
                            isReply: getBool("is_reply"),
                            hasQuote: getBool("has_quote"),
                            quotedText: getString("quoted_text"),
                            isQuoteAReply: getBool("is_quote_a_reply"),
                        };
                    }

                    entries.push({ text: txt, metadata });
                }

                resolve(entries);
            };
            reader.onerror = () => reject(new Error(t("projects.entries.new.errorReadFailed")));
            reader.readAsText(file);
        });
    };

    const handleSubmit = async () => {
        if (!parsedEntries) return;
        onUpload(parsedEntries);
    };

    const dropzoneClasses = `
    border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center gap-4 transition-all duration-300
    ${isDragActive ? "border-primary bg-primary/10 scale-[1.02]" : file ? (error ? "border-bittersweet-shimmer bg-bittersweet-shimmer/5 scale-100" : "border-green-500 bg-green-500/5") : "border-white/10 hover:border-primary/40 bg-white/5"}
  `;

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Visual Example & Template Download */}
            <div className="bg-surface-dark border border-white/10 rounded-xl p-6 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-4 relative z-10 flex-col md:flex-row gap-4">
                    <div>
                        <h3 className="text-white-1 font-bold flex items-center gap-2 mb-1">
                            {isTwitter ? <XLogo /> : <TableProperties size={18} className="text-primary" />}
                            {t("projects.entries.new.bulkUpload.dataFormatTitle")}
                        </h3>
                        <p className="text-light-gray-70 text-sm">
                            {t("projects.entries.new.bulkUpload.formatInstruction")}
                        </p>
                        <p className="text-light-gray-70 text-sm mt-1">
                            <Trans
                                i18nKey="projects.entries.new.bulkUpload.mandatoryHeaderNote"
                                components={{ 1: <span className="text-yellow-400 font-bold" /> }}
                                defaults="Mandatory headers are <1>bolded</1>."
                            />
                        </p>
                    </div>
                    <button
                        onClick={generateTemplate}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white-1 bg-surface-dark border border-white/10 hover:bg-yellow-400 hover:text-background-dark hover:border-yellow-400 rounded-lg transition-colors whitespace-nowrap"
                    >
                        <DownloadCloud size={16} />
                        {t("projects.entries.new.bulkUpload.downloadTemplate")}
                    </button>
                </div>

                <div className="overflow-x-auto relative z-10 rounded-lg border border-white/10 bg-background-dark">
                    <table className="w-full text-left font-mono text-xs">
                        <thead className="bg-white/5 text-light-gray-50 border-b border-white/10">
                            <tr>
                                {expectedHeaders.map(header => {
                                    const isMandatory = header === "text";
                                    // Custom widths for specific columns
                                    const widthClass = header === "text" || header === "quoted_text" ? "min-w-[200px] w-auto" :
                                        header === "date" ? "min-w-[150px] w-[150px]" :
                                            "w-[100px]";
                                    return (
                                        <th key={header} className={`p-3 uppercase tracking-wider whitespace-nowrap ${widthClass} ${isMandatory ? "font-bold text-yellow-400" : "font-normal"}`}>
                                            {header}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody className="text-white-1/80 divide-y divide-white/5">
                            {isTwitter ? (
                                <>
                                    <tr className="hover:bg-white/5 transition-colors">
                                        <td className="p-3 border-r border-white/5 whitespace-nowrap truncate max-w-[250px]">"This is a sample entry"</td>
                                        <td className="p-3 border-r border-white/5">"Jan 01, 2026"</td>
                                        <td className="p-3 border-r border-white/5 text-purple-400">false</td>
                                        <td className="p-3 border-r border-white/5 text-purple-400">true</td>
                                        <td className="p-3 border-r border-white/5 whitespace-nowrap truncate max-w-[250px]">"This is a quoted entry"</td>
                                        <td className="p-3 text-purple-400">false</td>
                                    </tr>
                                    <tr className="hover:bg-white/5 transition-colors">
                                        <td className="p-3 border-r border-white/5 whitespace-nowrap truncate max-w-[250px]">"Another simple entry"</td>
                                        <td className="p-3 border-r border-white/5 text-gray-400"></td>
                                        <td className="p-3 border-r border-white/5 text-purple-400">false</td>
                                        <td className="p-3 border-r border-white/5 text-purple-400">false</td>
                                        <td className="p-3 border-r border-white/5 text-gray-400"></td>
                                        <td className="p-3 text-purple-400">false</td>
                                    </tr>
                                </>
                            ) : (
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="p-3">"Just a simple text entry to analyze."</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={dropzoneClasses}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv"
                    className="hidden"
                    aria-label="csv-upload-input"
                />

                {file ? (
                    <div className="flex flex-col items-center gap-4 pointer-events-none">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center animate-bounce-subtle ${error ? "bg-bittersweet-shimmer/20 text-bittersweet-shimmer" : "bg-green-500/20 text-green-500"}`}>
                            {error ? <AlertCircle size={32} /> : <FileText size={32} />}
                        </div>
                        <div className="text-center">
                            <p className={`font-bold text-xl mb-1 ${error ? "text-bittersweet-shimmer" : "text-white-1"}`}>
                                {file.name}
                            </p>
                            <p className={`text-sm ${error ? "text-bittersweet-shimmer/70" : "text-light-gray-70"}`}>
                                {(file.size / 1024).toFixed(1)} KB
                            </p>
                        </div>
                        <button
                            onClick={() => { setFile(null); setError(null); setParsedEntries(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                            className="mt-2 px-6 py-2 rounded-lg text-white-1 bg-bittersweet-shimmer hover:bg-bittersweet-shimmer/80 transition-colors font-bold pointer-events-auto shadow-lg flex items-center gap-2"
                            title={t("projects.entries.new.removeFile", "Remove file")}
                        >
                            <Trash2 size={20} />
                            {t("projects.entries.new.removeFile", "Remove file")}
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 pointer-events-none">
                        <div className="w-20 h-20 rounded-full bg-white/5 text-light-gray-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <Upload size={40} />
                        </div>
                        <div className="text-center">
                            <p className="text-white-1 font-bold text-xl mb-1">
                                {t("projects.entries.new.dropzoneTitle")}
                            </p>
                            <p className="text-light-gray-70">
                                {t("projects.entries.new.dropzoneSubtitle")}
                            </p>
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-2 px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white-1 font-semibold transition-colors pointer-events-auto"
                            title={t("projects.entries.new.selectFile")}
                        >
                            {t("projects.entries.new.selectFile")}
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-bittersweet-shimmer/10 border border-bittersweet-shimmer/20 text-bittersweet-shimmer animate-in shake duration-300">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {parsedEntries && !error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 animate-in fade-in slide-in-from-top-2 duration-300">
                    <CheckCircle2 size={20} />
                    <p className="text-sm font-bold">
                        {t("projects.entries.new.bulkUpload.readyCount", {
                            count: parsedEntries.length
                        })}
                    </p>
                </div>
            )}

            {parsedEntries && !error && (
                <div className="flex justify-end p-2 animate-in fade-in duration-300">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-background-dark font-bold rounded-lg transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            t("common.submitting")
                        ) : (
                            <>
                                <CheckCircle2 size={18} />
                                {t("projects.entries.new.bulkUpload.uploadButton", "Upload")}
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Helper info */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                <h4 className="text-white-1 font-bold mb-3 flex items-center gap-2">
                    <AlertCircle size={16} className="text-primary" />
                    {t("projects.entries.new.csvInstructionsTitle")}
                </h4>
                <ul className="text-sm text-light-gray-70 space-y-2 list-disc pl-5">
                    <li>{t("projects.entries.new.csvInstruction1")}</li>
                    <li>{t("projects.entries.new.csvInstruction2")}</li>
                    <li>{t("projects.entries.new.csvInstruction3")}</li>
                </ul>
            </div>
        </div>
    );
};
