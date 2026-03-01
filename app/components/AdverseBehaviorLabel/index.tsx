import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const AdverseBehaviorLabel = ({ className }: { className?: string }) => {
    return (
        <span className={cn("font-medium text-primary/90", className)}>
            Adverse Human Behaviours
        </span>
    );
};
