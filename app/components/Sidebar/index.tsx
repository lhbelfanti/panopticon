import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Logo } from "~/components/Logo";
import ConfirmationModal from "~/components/ConfirmationModal";
import packageJson from "../../../package.json";
import { Link } from "react-router";
import { NavItem } from "./NavItem";

import {
  ChevronLeft,
  ChevronRight,
  CopyPlus,
  Folder,
  Home,
  LogOut,
  PlusCircle,
  UserCircle,
} from "lucide-react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { SidebarProps } from "./types";

const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const Sidebar = (props: SidebarProps) => {
  const { projects, user } = props;
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { t, i18n } = useTranslation();

  const toggleSidebar = () => setCollapsed(!collapsed);

  const asideClasses = cn(
    "flex flex-col bg-sidebar-dark text-light-gray h-screen transition-all duration-300 border-r border-white/5 shadow-2xl relative",
    collapsed ? "w-20" : "w-72",
  );

  const toggleClasses =
    "absolute -right-3 top-8 bg-surface-dark hover:bg-primary border border-white/20 hover:border-transparent text-light-gray hover:text-background-dark rounded-full p-1.5 shadow-xl transition-colors z-50 flex items-center justify-center";

  return (
    <>
      <aside className={asideClasses}>
        {/* Collapse Toggle */}
        <button
          onClick={toggleSidebar}
          className={toggleClasses}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Header / Logo Component */}
        <div className="flex flex-col items-center justify-center p-6 pt-14 border-b border-white/5 min-h-[10rem] relative overflow-hidden">
          <Link to="/" className="group w-full flex flex-col items-center justify-center transition-transform hover:scale-105">
            <Logo
              collapsed={collapsed}
              logoClassName={collapsed ? "w-10" : "w-30"}
              backgroundClassName="text-3xl top-1/2 -translate-y-1/2"
              textClassName="text-sm mt-3"
            />
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 flex flex-col gap-8 custom-scrollbar relative z-10 overflow-y-auto overflow-x-hidden p-3">
          {/* Home / Core */}
          <div className="flex flex-col gap-1.5">
            <NavItem
              to="/"
              icon={<Home size={20} className="transition-colors" />}
              label={t("sidebar.home")}
              collapsed={collapsed}
            />
          </div>

          {/* Acciones Rápidas */}
          <div className="flex flex-col gap-1.5">
            {!collapsed && (
              <h3 className="px-3 text-[0.65rem] font-bold text-light-gray-70 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <PlusCircle size={12} className="opacity-50" />
                {t("sidebar.quickActions")}
              </h3>
            )}
            <NavItem
              to="/entries/new"
              icon={<CopyPlus size={18} className="transition-colors" />}
              label={t("sidebar.newEntry")}
              collapsed={collapsed}
              indented={!collapsed}
            />
            <NavItem
              to="/projects/new"
              icon={<Folder size={18} className="transition-colors" />}
              label={t("sidebar.newProject")}
              collapsed={collapsed}
              indented={!collapsed}
            />
          </div>

          {/* Tus Proyectos */}
          <div className="flex flex-col gap-1.5">
            {!collapsed && (
              <h3 className="px-3 text-[0.65rem] font-bold text-light-gray-70 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <Folder size={12} className="opacity-50" />
                {t("sidebar.yourProjects")}
              </h3>
            )}
            {projects.map((project) => (
              <NavItem
                key={project.id}
                to={`/projects/${project.id}`}
                icon={<Folder size={18} className="transition-colors" />}
                label={project.name}
                collapsed={collapsed}
                indented={!collapsed}
                subItems={project.subprojects?.map((sub) => ({
                  id: sub.id,
                  to: `/projects/${project.id}/models/${sub.model}`,
                  label: t(`projects.models.${sub.model}`),
                }))}
              />
            ))}
            {projects.length === 0 && !collapsed && (
              <div className="px-8 py-2 text-xs text-light-gray-70 italic">
                {t("sidebar.noActiveProjects")}
              </div>
            )}
          </div>
        </nav>

        {/* Footer / User Settings */}
        <div className="mt-auto border-t border-white/5 p-4 bg-black/20 flex flex-col gap-2">
          <div
            className={cn(
              "flex items-center",
              collapsed ? "justify-center" : "justify-between gap-2",
            )}
          >
            <button
              className={cn(
                "group flex items-center gap-3 overflow-hidden text-left rounded-full hover:bg-primary transition-colors p-1.5",
                collapsed && "justify-center",
              )}
            >
              <div className="flex-shrink-0 bg-surface-dark group-hover:bg-primary group-hover:border-transparent rounded-full p-2 border border-white/5 shadow-inner transition-colors">
                <UserCircle
                  size={24}
                  className="text-primary group-hover:text-background-dark transition-colors"
                />
              </div>
              {!collapsed && (
                <div className="flex flex-col min-w-0 pr-2 transition-colors">
                  <span className="text-sm font-semibold text-white-1 group-hover:text-background-dark leading-tight truncate">
                    {user ? `${user.name} ${user.lastName}` : "Research User"}
                  </span>
                  <span className="text-xs text-light-gray-70 group-hover:text-background-dark/80 truncate">
                    {user ? user.nickname : "@research"}
                  </span>
                </div>
              )}
            </button>
            {!collapsed && (
              <button
                onClick={() => setShowLogoutModal(true)}
                className="group flex-shrink-0 text-bittersweet-shimmer transition-all p-2.5 rounded-full hover:bg-bittersweet-shimmer hover:scale-105"
                title={t("sidebar.logout")}
              >
                <LogOut
                  size={18}
                  className="group-hover:text-white-1 transition-colors"
                />
              </button>
            )}
          </div>
          {!collapsed && (
            <div className="flex justify-start pr-2">
              <span className="text-[10px] text-light-gray-70 opacity-40 uppercase tracking-tighter">
                Version: {packageJson.version}
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* Global Styled Confirmation Modal Baseline (Matches Panopticon Dark Auth forms) */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        icon={<LogOut size={28} />}
        title={t("sidebar.logoutConfirmTitle")}
        description={t("sidebar.logoutConfirmDesc")}
        cancelText={t("sidebar.cancel")}
        confirmText={t("sidebar.logoutConfirmTitle")}
        confirmAction="/login"
        confirmMethod="get"
        isDestructive={true}
      />
    </>
  );
};
