import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: (string | undefined | null | false)[]) => {
    return twMerge(clsx(inputs));
};

interface LogoProps {
    collapsed?: boolean;
    className?: string;           // Overall container
    logoClassName?: string;       // The img
    textClassName?: string;       // Front text "PANOPTICON" (if present, rendered below logo)
    backgroundClassName?: string; // Background text "PANOPTICON"
    showFrontText?: boolean;      // Whether to show the bottom "PANOPTICON" text
}

export const Logo = ({
    collapsed = false,
    className,
    logoClassName,
    textClassName,
    backgroundClassName,
    showFrontText = true
}: LogoProps) => {
    return (
        <div className={cn("flex flex-col items-center justify-center relative w-full transition-all duration-300", className)}>
            {!collapsed && (
                <span className={cn("absolute w-full text-center text-primary/10 font-black tracking-widest select-none pointer-events-none drop-shadow-sm whitespace-nowrap overflow-hidden max-w-full z-0", backgroundClassName)}>
                    PANOPTICON
                </span>
            )}
            <img
                src="/panopticon-logo-no-text.png"
                alt="Panopticon Logo"
                className={cn("relative z-10 h-auto drop-shadow-2xl transition-all duration-300", collapsed ? "w-10" : "w-32", logoClassName)}
            />
            {!collapsed && showFrontText && (
                <span className={cn("text-primary font-bold tracking-[0.2em] relative z-10 drop-shadow-md", textClassName)}>
                    PANOPTICON
                </span>
            )}
        </div>
    );
};
