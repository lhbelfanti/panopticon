import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const AdverseBehaviorLabel = (props: {
    className?: string;
    children?: React.ReactNode;
}) => {
    const { className, children } = props;
    return (
        <span className={cn("font-medium text-primary/90", className)}>
            {children || "Adverse Human Behaviours"}
        </span>
    );
};
