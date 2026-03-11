import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AdverseBehaviorLabelProps } from "./types";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const AdverseBehaviorLabel = (props: AdverseBehaviorLabelProps) => {
    const { className, children } = props;
    return (
        <span className={cn("font-medium text-primary/90", className)}>
            {children || "Adverse Human Behaviours"}
        </span>
    );
};
