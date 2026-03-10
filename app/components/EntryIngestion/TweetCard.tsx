import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import type { TwitterMetadata } from "~/services/api/entries/types";

// X (Twitter) Logo SVG component
const XLogo = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 fill-current">
        <g>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
        </g>
    </svg>
);

interface TweetCardProps {
    mode: "readOnly" | "interactive";
    initialData?: {
        text: string;
        metadata: TwitterMetadata;
    };
    onChange?: (data: { text: string; metadata: TwitterMetadata }) => void;
}

export const TweetCard: React.FC<TweetCardProps> = ({ mode, initialData, onChange }) => {
    const { t, i18n } = useTranslation();

    const [text, setText] = useState(initialData?.text || "");
    const [metadata, setMetadata] = useState<TwitterMetadata>(
        initialData?.metadata || {
            isReply: false,
            hasQuote: false,
            quotedText: "",
            isQuoteAReply: false,
            date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        }
    );

    // Sync internal state when initialData prop changes (e.g., reset after submission)
    React.useEffect(() => {
        if (initialData) {
            setText(initialData.text);
            setMetadata(initialData.metadata);
        }
    }, [initialData]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value;
        setText(newText);
        onChange?.({ text: newText, metadata });
    };

    const handleMetadataChange = (key: keyof TwitterMetadata, value: any) => {
        const newMetadata = { ...metadata, [key]: value };
        setMetadata(newMetadata);
        onChange?.({ text, metadata: newMetadata });
    };

    const isInteractive = mode === "interactive";

    return (
        <div className="w-full max-w-3xl mx-auto font-sans">
            {/* Main Tweet Card Container */}
            <div className={`relative mt-8 bg-surface-dark text-white-1 p-4 sm:p-6 rounded-2xl shadow-md border ${metadata.isReply ? 'rounded-tl-none border-[#1da1f2]' : 'border-white/10'}`}>
                {/* Reply Context Header (optional) */}
                {metadata.isReply && (
                    <div className="absolute -top-[28px] left-[-1px] text-white-1 text-xs font-bold px-4 py-1.5 rounded-t-xl z-0 whitespace-nowrap overflow-hidden text-ellipsis shadow-sm" style={{ backgroundColor: "#4A99E9" }}>
                        {t("projects.entries.new.interactiveForm.isResponse", "Este tweet es una respuesta a otro tweet")}
                    </div>
                )}

                {/* Header: Author Info & Logo */}
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                        {/* Placeholder Avatar */}
                        <div className="w-12 h-12 rounded-full bg-light-gray-60 overflow-hidden flex-shrink-0">
                            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236b7280'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E" alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-[15px] leading-5">{t("projects.entries.new.interactiveForm.tweetAuthor", "Tweet Author")}</span>
                            <span className="text-light-gray-60 text-[15px] leading-5">{t("projects.entries.new.interactiveForm.authorHandle", "@tweet_author")}</span>
                            {/* Date Field */}
                            {isInteractive ? (
                                <div className="flex items-center gap-2 mt-1">
                                    <input
                                        type="datetime-local"
                                        className="text-light-gray-50 text-[13px] leading-5 bg-transparent border-b border-light-gray-30 focus:outline-none focus:border-[#1da1f2] placeholder:text-light-gray-70 [color-scheme:dark]"
                                        value={metadata.date || ""}
                                        onChange={(e) => handleMetadataChange("date", e.target.value)}
                                    />
                                    {metadata.date && (
                                        <button
                                            type="button"
                                            onClick={() => handleMetadataChange("date", "")}
                                            className="text-light-gray-50 hover:text-red-400 text-xs px-2 py-0.5 rounded border border-white/10"
                                        >
                                            {t("common.delete", "Delete")}
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <span className="text-light-gray-60 text-[15px] leading-5">
                                    {metadata.date ? new Intl.DateTimeFormat(i18n.language || 'en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(metadata.date)) : ""}
                                </span>
                            )}
                        </div>
                    </div>
                    {/* X Logo */}
                    <div className="text-white-1 flex-shrink-0 pt-1">
                        <XLogo />
                    </div>
                </div>

                {/* Main Tweet Content */}
                <div className="text-[17px] leading-6 whitespace-pre-wrap word-break break-words mb-4 relative z-10">
                    {isInteractive ? (
                        <textarea
                            className="w-full min-h-[120px] bg-transparent resize-y outline-none border-b border-transparent focus:border-white/20 transition-colors placeholder:text-light-gray-70 text-white-1 leading-relaxed custom-scrollbar"
                            placeholder={t("projects.entries.new.interactiveForm.placeholder", "Ingresa el texto a analizar...")}
                            value={text}
                            onChange={handleTextChange}
                        />
                    ) : (
                        <span>{text}</span>
                    )}
                </div>

                {/* Quoted Tweet Section */}
                {metadata.hasQuote && (
                    <div className={`border ${metadata.isQuoteAReply ? 'rounded-2xl rounded-tl-none border-[#1da1f2] z-10' : 'border-white/10 rounded-2xl'} p-4 sm:p-5 relative mt-10`}>
                        {/* Quoted Tweet Context label */}
                        <div className="absolute -top-[14px] right-4 bg-surface-dark border border-white/20 text-white-1 text-[11px] font-bold px-3 py-1 rounded-full z-30 shadow-sm">
                            {t("projects.entries.new.interactiveForm.tweetCyted", "Tweet citado")}
                        </div>

                        {/* Is Quote a Reply Context Header */}
                        {metadata.isQuoteAReply && (
                            <div className="absolute -top-[24px] left-[-1px] bg-[#4A99E9] text-white-1 text-[10px] font-bold px-3 py-1 rounded-t-xl z-0 whitespace-nowrap overflow-hidden text-ellipsis shadow-sm max-w-[calc(100%-10px)]">
                                {t("projects.entries.new.interactiveForm.isQuoteAResponse", "Este tweet es una respuesta a otro tweet")}
                            </div>
                        )}

                        {/* Connector Pill */}
                        <div className="absolute -left-12 top-11 bg-[#4A99E9] text-white-1 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap z-20 shadow-md flex items-center gap-1">
                            {t("projects.entries.new.interactiveForm.quote", "Cita")} <span className="text-[10px]">&gt;</span>
                        </div>

                        {/* Quoted Header: Author Info & Logo */}
                        <div className="flex justify-between items-start mb-3 pt-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-light-gray-60 overflow-hidden flex-shrink-0">
                                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236b7280'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E" alt="Quoted Avatar" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-[14px] leading-4">{t("projects.entries.new.interactiveForm.quotedAuthor", "Quoted Author")}</span>
                                    <span className="text-light-gray-60 text-[14px] leading-4">{t("projects.entries.new.interactiveForm.quotedHandle", "@quoted_author")}</span>
                                </div>
                            </div>
                            <div className="text-light-gray-60 flex-shrink-0 w-5 h-5">
                                <XLogo />
                            </div>
                        </div>

                        <div className="text-[15px] leading-5 whitespace-pre-wrap word-break break-words">
                            {isInteractive ? (
                                <textarea
                                    className="w-full min-h-[80px] bg-transparent resize-y outline-none border-b border-transparent focus:border-white/20 transition-colors placeholder:text-light-gray-70 text-white-1 custom-scrollbar"
                                    placeholder={t("projects.entries.new.interactiveForm.quotedPlaceholder", "Ingrese el texto del tweet citado...")}
                                    value={metadata.quotedText || ""}
                                    onChange={(e) => handleMetadataChange("quotedText", e.target.value)}
                                />
                            ) : (
                                <span>{metadata.quotedText}</span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Interactive Toggle Controls (Only visible in edit mode and outside the card to not clutter the preview) */}
            {isInteractive && (
                <div className="mt-6 flex flex-wrap gap-6 bg-surface-dark border border-white/10 p-4 rounded-xl">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center pr-2">
                            <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={metadata.isReply}
                                onChange={(e) => handleMetadataChange("isReply", e.target.checked)}
                            />
                            <div className="w-10 h-6 bg-background-dark/50 rounded-full border border-white/10 peer-checked:bg-primary peer-checked:border-primary transition-all duration-300 relative after:content-[''] after:absolute after:left-[3px] after:top-[3px] after:w-4 after:h-4 after:bg-light-gray-70 after:rounded-full after:transition-all after:duration-300 peer-checked:after:translate-x-[16px] peer-checked:after:bg-white"></div>
                        </div>
                        <span className="text-light-gray-70 group-hover:text-white-1 transition-colors text-sm font-medium select-none">
                            {t("projects.entries.new.interactiveForm.isResponseCheckbox", "¿Es una respuesta?")}
                        </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center pr-2">
                            <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={metadata.hasQuote}
                                onChange={(e) => {
                                    handleMetadataChange("hasQuote", e.target.checked);
                                }}
                            />
                            <div className="w-10 h-6 bg-background-dark/50 rounded-full border border-white/10 peer-checked:bg-primary peer-checked:border-primary transition-all duration-300 relative after:content-[''] after:absolute after:left-[3px] after:top-[3px] after:w-4 after:h-4 after:bg-light-gray-70 after:rounded-full after:transition-all after:duration-300 peer-checked:after:translate-x-[16px] peer-checked:after:bg-white"></div>
                        </div>
                        <span className="text-light-gray-70 group-hover:text-white-1 transition-colors text-sm font-medium select-none">
                            {t("projects.entries.new.interactiveForm.hasQuoteCheckbox", "¿Tiene cita?")}
                        </span>
                    </label>

                    {metadata.hasQuote && (
                        <label className="flex items-center gap-2 cursor-pointer group pl-4 border-l border-white/10">
                            <div className="relative flex items-center pr-2">
                                <input
                                    type="checkbox"
                                    className="peer sr-only"
                                    checked={metadata.isQuoteAReply || false}
                                    onChange={(e) => handleMetadataChange("isQuoteAReply", e.target.checked)}
                                />
                                <div className="w-10 h-6 bg-background-dark/50 rounded-full border border-white/10 peer-checked:bg-primary peer-checked:border-primary transition-all duration-300 relative after:content-[''] after:absolute after:left-[3px] after:top-[3px] after:w-4 after:h-4 after:bg-light-gray-70 after:rounded-full after:transition-all after:duration-300 peer-checked:after:translate-x-[16px] peer-checked:after:bg-white"></div>
                            </div>
                            <span className="text-light-gray-70 group-hover:text-white-1 transition-colors text-sm font-medium select-none">
                                {t("projects.entries.new.interactiveForm.isQuoteResponseCheckbox", "¿La cita es una respuesta?")}
                            </span>
                        </label>
                    )}
                </div>
            )}
        </div>
    );
};
