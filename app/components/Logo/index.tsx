import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { LogoProps } from "./types";

const cn = (...inputs: (string | undefined | null | false)[]) => {
  return twMerge(clsx(inputs));
};

export const Logo = (props: LogoProps) => {
  const {
    collapsed = false,
    className,
    logoClassName,
    textClassName,
    backgroundClassName,
    showFrontText = true,
  } = props;
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center relative w-full transition-all duration-300",
        className,
      )}
    >
      {!collapsed && (
        <span
          className={cn(
            "absolute w-full text-center text-primary/10 font-black tracking-widest select-none pointer-events-none drop-shadow-sm whitespace-nowrap overflow-hidden max-w-full z-0",
            backgroundClassName,
          )}
        >
          PANOPTICON
        </span>
      )}
      <img
        src="/panopticon-logo-no-text.png"
        alt="Panopticon Logo"
        className={cn(
          "relative z-10 h-auto drop-shadow-2xl transition-all duration-300",
          collapsed ? "w-10" : "w-32",
          logoClassName,
        )}
      />
      {!collapsed && showFrontText && (
        <span
          className={cn(
            "text-primary font-bold tracking-[0.2em] relative z-10 drop-shadow-md",
            textClassName,
          )}
        >
          PANOPTICON
        </span>
      )}
    </div>
  );
};
