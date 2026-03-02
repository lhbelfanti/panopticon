import { useState, useRef } from "react";
import { Upload, X, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BulkUploadProps {
    onUpload: (texts: string[]) => void;
    isSubmitting?: boolean;
}

export const BulkUpload = ({ onUpload, isSubmitting }: BulkUploadProps) => {
    const { t } = useTranslation();
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        setError(null);

        if (selectedFile) {
            if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
                setError(t("entries.new.errorInvalidCsv"));
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files?.[0];
        setError(null);

        if (droppedFile) {
            if (droppedFile.type !== "text/csv" && !droppedFile.name.endsWith(".csv")) {
                setError(t("entries.new.errorInvalidCsv"));
                return;
            }
            setFile(droppedFile);
        }
    };

    const parseCsv = async (file: File): Promise<string[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                const lines = text.split(/\r?\n/);

                // Find "text" column
                const header = lines[0]?.split(",");
                const textIndex = header?.findIndex((h) => h.trim().toLowerCase() === "text");

                if (textIndex === undefined || textIndex === -1) {
                    reject(new Error("No 'text' column found in CSV"));
                    return;
                }

                const entries = lines.slice(1)
                    .map(line => {
                        const columns = line.split(",");
                        return columns[textIndex]?.trim();
                    })
                    .filter(t => t && t.length > 0);

                resolve(entries);
            };
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsText(file);
        });
    };

    const handleSubmit = async () => {
        if (!file) return;
        setError(null);

        try {
            const entries = await parseCsv(file);
            if (entries.length === 0) {
                setError("CSV is empty or has no valid entries");
                return;
            }
            onUpload(entries);
        } catch (err: any) {
            setError(err.message || "Failed to parse CSV");
        }
    };

    const dropzoneClasses = `
    border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center gap-4 transition-all duration-300
    ${file ? "border-primary bg-primary/5" : "border-white/10 hover:border-primary/40 bg-white/5"}
    ${error ? "border-bittersweet-shimmer bg-bittersweet-shimmer/5" : ""}
  `;

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div
                onDragOver={(e) => e.preventDefault()}
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
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center animate-bounce-subtle">
                            <FileText size={32} />
                        </div>
                        <div className="text-center">
                            <p className="text-white-1 font-bold text-lg">{file.name}</p>
                            <p className="text-light-gray-70 text-sm">
                                {(file.size / 1024).toFixed(1)} KB
                            </p>
                        </div>
                        <button
                            onClick={() => setFile(null)}
                            className="text-light-gray-70 hover:text-bittersweet-shimmer transition-colors"
                            title="Remove file"
                        >
                            <X size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-white/5 text-light-gray-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <Upload size={40} />
                        </div>
                        <div className="text-center">
                            <p className="text-white-1 font-bold text-xl mb-1">
                                {t("entries.new.dropzoneTitle")}
                            </p>
                            <p className="text-light-gray-70">
                                {t("entries.new.dropzoneSubtitle")}
                            </p>
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-2 px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white-1 font-semibold transition-colors"
                            title={t("entries.new.selectFile")}
                        >
                            {t("entries.new.selectFile")}
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

            {file && !error && (
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
                                {t("entries.new.confirmUpload")}
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Helper info */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                <h4 className="text-white-1 font-bold mb-3 flex items-center gap-2">
                    <AlertCircle size={16} className="text-primary" />
                    {t("entries.new.csvInstructionsTitle")}
                </h4>
                <ul className="text-sm text-light-gray-70 space-y-2 list-disc pl-5">
                    <li>{t("entries.new.csvInstruction1")}</li>
                    <li>{t("entries.new.csvInstruction2")}</li>
                    <li>{t("entries.new.csvInstruction3")}</li>
                </ul>
            </div>
        </div>
    );
};
