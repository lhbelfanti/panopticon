import type { ReactNode } from "react";

export interface BackButtonProps {
    to: string;
    text: string;
    icon?: ReactNode;
    className?: string;
}
