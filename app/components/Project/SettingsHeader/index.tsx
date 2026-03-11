import React from "react";
import { Settings } from "lucide-react";
import type { SettingsHeaderProps } from "./types";

export const SettingsHeader = (props: SettingsHeaderProps) => {
    const { title, description } = props;

    return (
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-4xl font-extrabold text-white-1 mb-3 tracking-tight flex items-center gap-3">
                <Settings size={36} className="text-primary" />
                {title}
            </h1>
            <p className="text-light-gray-70 text-lg">
                {description}
            </p>
        </div>
    );
};
