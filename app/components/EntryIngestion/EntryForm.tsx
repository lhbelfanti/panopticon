import { useState } from "react";
import { Send } from "lucide-react";
import { useTranslation } from "react-i18next";

interface EntryFormProps {
    onSubmit: (text: string) => void;
    isSubmitting?: boolean;
}

export const EntryForm = ({ onSubmit, isSubmitting }: EntryFormProps) => {
    const { t } = useTranslation();
    const [text, setText] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onSubmit(text);
            setText("");
        }
    };

    const textareaClasses =
        "w-full min-h-[200px] bg-sidebar-dark border border-white/10 rounded-xl p-4 text-white-1 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:opacity-30 resize-none text-lg leading-relaxed";

    const submitButtonClasses =
        "flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-background-dark font-bold rounded-lg transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed";

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-3">
                <label htmlFor="entry-text" className="text-sm font-bold text-light-gray-70 uppercase tracking-widest pl-1">
                    {t("entries.new.manualEntryLabel")}
                </label>
                <textarea
                    id="entry-text"
                    name="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={t("entries.new.placeholder")}
                    required
                    className={textareaClasses}
                />
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting || !text.trim()}
                    className={submitButtonClasses}
                >
                    {isSubmitting ? (
                        t("common.submitting")
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
