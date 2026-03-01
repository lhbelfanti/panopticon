import { useState } from "react";
import { NavLink, useLocation } from "react-router";
import { type ClassValue, clsx } from "clsx";
import * as LucideIcons from "lucide-react";
import { twMerge } from "tailwind-merge";
import type { NavItemProps } from "./types";

const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const NavItem = (props: NavItemProps) => {
  const { to, icon, label, collapsed, indented = false, subItems } = props;
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  const hasSubItems = subItems && subItems.length > 0;

  return (
    <div className="flex flex-col w-full">
      <div className="relative group flex items-center w-full">
        <NavLink
          to={to}
          className={({ isActive }) =>
            cn(
              "flex items-center rounded-xl p-2.5 transition-all duration-200 group relative w-full",
              collapsed
                ? "justify-center"
                : cn("justify-start gap-3", indented && "pl-5"),
              isActive
                ? "bg-primary text-background-dark font-semibold shadow-sm border border-transparent"
                : "text-light-gray hover:bg-white/5 hover:text-white-1 hover:translate-x-1",
            )
          }
          title={collapsed ? label : undefined}
        >
          {({ isActive }) => (
            <>
              <div
                className={cn(
                  "flex-shrink-0 flex items-center justify-center",
                  isActive
                    ? "text-background-dark"
                    : "text-light-gray-70 group-hover:text-white-1",
                )}
              >
                {icon}
              </div>

              {!collapsed && (
                <span
                  className={cn(
                    "truncate text-sm tracking-wide",
                    hasSubItems && "pr-6",
                  )}
                >
                  {label}
                </span>
              )}
              {hasSubItems && !collapsed && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md transition-all z-10",
                    isActive
                      ? "text-background-dark hover:bg-black/10"
                      : "text-light-gray-70 hover:text-white-1 hover:bg-white/10"
                  )}
                >
                  {isExpanded ? (
                    <LucideIcons.ChevronDown size={14} />
                  ) : (
                    <LucideIcons.ChevronRight size={14} />
                  )}
                </button>
              )}
            </>
          )}
        </NavLink>
      </div>

      {/* Sub Items Dropdown */}
      {isExpanded && hasSubItems && !collapsed && (
        <div className="flex flex-col mt-1 mb-2 ml-[3.2rem] border-l border-white/10 pl-3 gap-1 animate-in slide-in-from-top-2 duration-200">
          {subItems.map((sub) => (
            <NavLink
              key={sub.id}
              to={sub.to}
              className={({ isActive }) =>
                cn(
                  "text-xs truncate py-2 px-3 rounded-lg transition-colors border border-transparent flex items-center gap-2",
                  isActive
                    ? "bg-primary/10 text-primary border-primary/20 font-medium shadow-inner"
                    : "text-light-gray-70 hover:text-white-1 hover:bg-white/5 hover:border-white/10",
                )
              }
              title={sub.label}
            >
              <LucideIcons.Box size={14} className="flex-shrink-0" />
              {sub.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};
