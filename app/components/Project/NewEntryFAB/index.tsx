import React from "react";
import { Link } from "react-router";
import { PlusCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { NewEntryFABProps } from "./types";

export const NewEntryFAB = (props: NewEntryFABProps) => {
    const { projectId } = props;
    const { t } = useTranslation();

    return (
        <div className="fixed bottom-8 right-8 z-40 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <Link
                to={`/entries/new?projectId=${projectId}`}
                className="flex items-center gap-2 px-6 py-4 bg-primary hover:bg-primary/90 text-background-dark font-bold rounded-full transition-all hover:-translate-y-1 hover:scale-105 shadow-2xl shadow-primary/30 group"
            >
                <PlusCircle size={22} className="group-hover:rotate-90 transition-transform duration-300" />
                <span className="text-base">{t("sidebar.newEntry")}</span>
            </Link>
        </div>
    );
};
