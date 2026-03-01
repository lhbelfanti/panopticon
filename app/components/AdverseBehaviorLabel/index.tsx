import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const AdverseBehaviorLabel = ({ className, children }: { className?: string, children?: React.ReactNode }) => {
    return (
        <span className={cn("font-medium text-primary/90", className)}>
            {children || "Adverse Human Behaviours"}
        </span>
    );
};
