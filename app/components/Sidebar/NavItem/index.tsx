import { NavLink } from "react-router";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { NavItemProps } from "./types";

const cn = (...inputs: ClassValue[]) => {
    return twMerge(clsx(inputs));
};

export const NavItem = ({ to, icon, label, collapsed, indented = false }: NavItemProps) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                cn(
                    "flex items-center rounded-xl p-2.5 transition-all duration-200 group relative",
                    collapsed ? "justify-center" : cn("justify-start gap-3 w-full", indented && "pl-5"),
                    isActive
                        ? "bg-primary text-background-dark font-semibold shadow-sm border border-transparent"
                        : "text-light-gray hover:bg-white/5 hover:text-white-1 hover:translate-x-1"
                )
            }
            title={collapsed ? label : undefined}
        >
            {({ isActive }) => (
                <>
                    <div className={cn("flex-shrink-0 flex items-center justify-center", isActive ? "text-background-dark" : "text-light-gray-70 group-hover:text-white-1")}>
                        {icon}
                    </div>

                    {!collapsed && (
                        <span className="truncate text-sm tracking-wide">
                            {label}
                        </span>
                    )}
                </>
            )}
        </NavLink>
    );
};
