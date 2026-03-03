import React from "react";

export interface CustomCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: React.ReactNode;
    icon?: React.ReactNode;
    notAvailableText?: string;
    wrapperClassName?: string;
    labelClassName?: string;
}

export const CustomCheckbox = React.forwardRef<HTMLInputElement, CustomCheckboxProps>(
    ({ label, icon, notAvailableText, wrapperClassName, labelClassName, disabled, className, ...props }, ref) => {
        const isEnabled = !disabled;

        const checkboxLabelClassName =
            "flex items-center gap-3 p-4 rounded-xl border border-white/5 hover:border-primary/50 bg-background-dark/50 cursor-pointer transition-all hover:shadow-lg hover:shadow-primary/5 group h-full";
        const checkboxInputClassName =
            "peer appearance-none w-5 h-5 border-2 border-white/20 rounded bg-transparent checked:bg-primary checked:border-primary transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0";

        return (
            <label
                className={`${!isEnabled ? "opacity-60 cursor-not-allowed border-white/5 bg-black/20" : checkboxLabelClassName} flex flex-col justify-center gap-2 rounded-xl border transition-all h-full ${isEnabled ? "hover:border-primary/50 cursor-pointer hover:shadow-lg hover:shadow-primary/5 group" : "hover:border-white/5 hover:shadow-none"} ${wrapperClassName || ""}`}
            >
                {!isEnabled && notAvailableText && (
                    <span className="text-[0.65rem] font-bold text-yellow-200/70 uppercase tracking-widest">
                        {notAvailableText}
                    </span>
                )}
                <div className="flex items-center gap-3 w-full">
                    <div className="relative flex items-center justify-center flex-shrink-0">
                        <input
                            type="checkbox"
                            ref={ref}
                            disabled={disabled}
                            className={`${checkboxInputClassName} ${className || ""}`}
                            {...props}
                        />
                        <svg
                            className={`absolute w-3.5 h-3.5 text-background-dark opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="3"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div className="flex items-center gap-2 overflow-hidden w-full h-full">
                        {icon && (
                            <div className={`flex-shrink-0 ${!isEnabled ? "saturate-0 opacity-50" : ""}`}>
                                {icon}
                            </div>
                        )}
                        <span
                            className={`text-sm font-medium transition-colors break-words text-left w-full leading-tight ${isEnabled ? "text-light-gray-80 group-hover:text-white-1" : "text-light-gray-60"} ${labelClassName || ""}`}
                            title={isEnabled && typeof label === "string" ? label : undefined}
                        >
                            {label}
                        </span>
                    </div>
                </div>
            </label>
        );
    }
);
CustomCheckbox.displayName = "CustomCheckbox";
