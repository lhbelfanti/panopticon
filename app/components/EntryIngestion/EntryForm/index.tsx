import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useActionData } from "react-router";
import { format } from "date-fns";
import { TweetCard } from "../TweetCard"; // Note: this will need update if TweetCard is also moved
import type { TwitterMetadata } from "~/services/api/entries/types";
import type { EntryFormProps } from "./types";

export const EntryForm = (props: EntryFormProps) => {
    const { onSubmit, isSubmitting } = props;
    const { t } = useTranslation();
    const actionData = useActionData<{ success?: boolean; error?: string }>();
    const [entryData, setEntryData] = useState<{ text: string; metadata: TwitterMetadata }>({
        text: "",
        metadata: {
            isReply: false,
            hasQuote: false,
            quotedText: "",
            isQuoteAReply: false,
            date: "",
        },
    });
    const [uploadAnother, setUploadAnother] = useState(false);

    useEffect(() => {
        // Reset form when action completes successfully (detected via actionData toggle)
        if (actionData?.success) {
            setEntryData({
                text: "",
                metadata: {
                    isReply: false,
                    hasQuote: false,
                    quotedText: "",
                    isQuoteAReply: false,
                    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                },
            });
        }
    }, [actionData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (entryData.text.trim()) {
            onSubmit(entryData.text, entryData.metadata, uploadAnother);
        }
    };

    const submitButtonClasses =
        "flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-background-dark font-bold rounded-lg transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed";

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center pl-1">
                    <label className="text-sm font-bold text-light-gray-70 uppercase tracking-widest">
                        {t("projects.entries.new.interactiveForm.title", "X (INTERACTIVE FORM)")}
                    </label>
                </div>

                <TweetCard
                    mode="interactive"
                    initialData={entryData}
                    onChange={(data) => setEntryData(data)}
                />
            </div>

            <div className="flex justify-between items-center bg-background-dark/50 p-4 rounded-xl border border-white/5 mt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center pr-2">
                        <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={uploadAnother}
                            onChange={(e) => setUploadAnother(e.target.checked)}
                        />
                        <div className="w-10 h-6 bg-background-dark/50 rounded-full border border-white/10 peer-checked:bg-primary peer-checked:border-primary transition-all duration-300 relative after:content-[''] after:absolute after:left-[3px] after:top-[3px] after:w-4 after:h-4 after:bg-light-gray-70 after:rounded-full after:transition-all after:duration-300 peer-checked:after:translate-x-[16px] peer-checked:after:bg-white"></div>
                    </div>
                    <span className="text-light-gray-70 group-hover:text-white-1 transition-colors text-sm font-medium select-none">
                        {t("projects.entries.new.interactiveForm.uploadAnother", "Upload another")}
                    </span>
                </label>

                <button
                    type="submit"
                    disabled={isSubmitting || !entryData.text.trim()}
                    className={submitButtonClasses}
                >
                    {isSubmitting ? (
                        t("common.submitting", "Submitting...")
                    ) : (
                        <>
                            <Send size={18} />
                            {t("entries.new.submit")}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};
