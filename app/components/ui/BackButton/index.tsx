import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import type { BackButtonProps } from "./types";

export const BackButton = (props: BackButtonProps) => {
    const { to, text, icon, className = "" } = props;

    const defaultClassName = "flex items-center gap-2 text-primary hover:text-white-1 transition-colors text-sm font-semibold max-w-max mb-8";

    return (
        <Link
            to={to}
            className={`${defaultClassName} ${className}`}
        >
            {icon || <ArrowLeft size={16} />}
            {text}
        </Link>
    );
};
