import { useState } from 'react';
import { NavLink } from 'react-router';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTranslation } from 'react-i18next';
import {
    ChevronLeft,
    ChevronRight,
    Home,
    PlusCircle,
    CopyPlus,
    Folder,
    LogOut,
    UserCircle,
    LibraryBig,
    Globe
} from 'lucide-react';
import type { SidebarProps } from './types';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function Sidebar({ projects }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const { t, i18n } = useTranslation();

    const toggleSidebar = () => setCollapsed(!collapsed);

    const toggleLanguage = () => {
        i18n.changeLanguage(i18n.language === "es" ? "en" : "es");
    };

    return (
        <>
            <aside
                className={cn(
                    "flex flex-col bg-sidebar-dark text-light-gray h-screen transition-all duration-300 border-r border-white/5 shadow-2xl relative",
                    collapsed ? "w-20" : "w-72"
                )}
            >
                {/* Collapse Toggle */}
                <button
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-8 bg-surface-dark hover:bg-primary border border-white/5 text-light-gray hover:text-background-dark rounded-full p-1 shadow-lg transition-colors z-50 flex items-center justify-center"
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                {/* Header / Logo Component */}
                <div className="flex flex-col items-center justify-center p-6 border-b border-white/5 min-h-[5rem] relative">
                    <div className={cn("flex items-center justify-center w-full transition-all duration-300")}>
                        {collapsed ? (
                            <img src="/panopticon-logo-no-text.png" alt="Panopticon" className="w-10 h-auto drop-shadow-md" />
                        ) : (
                            <img src="/panopticon-logo.png" alt="Panopticon" className="w-40 h-auto drop-shadow-md" />
                        )}
                    </div>
                    {/* Language Toggle */}
                    {!collapsed && (
                        <button
                            onClick={toggleLanguage}
                            className="absolute top-4 right-4 flex items-center gap-1.5 text-[10px] font-semibold text-light-gray-70 hover:text-primary bg-background-dark px-2 py-1 rounded-md border border-white/10 transition-colors"
                            title={t("sidebar.language")}
                        >
                            <Globe size={12} />
                            {i18n.language === "es" ? "EN" : "ES"}
                        </button>
                    )}
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
                            icon={<LibraryBig size={18} className="transition-colors" />}
                            label={t("sidebar.newProject")}
                            collapsed={collapsed}
                            indented={!collapsed}
                        />
                    </div>

                    {/* Tus Proyectos */}
                    <div className="flex flex-col gap-1.5">
                        {!collapsed && (
                            <h3 className="px-3 text-[0.65rem] font-bold text-light-gray-70 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                <LibraryBig size={12} className="opacity-50" />
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
                <div className="mt-auto border-t border-white/5 p-4 bg-black/20">
                    <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between gap-2")}>
                        <button className={cn("flex items-center gap-3 overflow-hidden text-left rounded-full hover:bg-white/5 transition-colors p-1.5", collapsed && "justify-center")}>
                            <div className="flex-shrink-0 bg-surface-dark rounded-full p-2 border border-white/5 shadow-inner">
                                <UserCircle size={24} className="text-primary group-hover:text-primary/80 transition-colors" />
                            </div>
                            {!collapsed && (
                                <div className="flex flex-col min-w-0 pr-2">
                                    <span className="text-sm font-semibold text-white-1 leading-tight truncate">{t("sidebar.admin")}</span>
                                    <span className="text-xs text-light-gray-70 truncate">{t("sidebar.thesis")}</span>
                                </div>
                            )}
                        </button>
                        {!collapsed && (
                            <button
                                onClick={() => setShowLogoutModal(true)}
                                className="flex-shrink-0 text-bittersweet-shimmer hover:opacity-80 transition-all p-2.5 rounded-full hover:bg-white/5 hover:scale-105"
                                title={t("sidebar.logout")}
                            >
                                <LogOut size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Global Styled Confirmation Modal Baseline (Matches Panopticon Dark Auth forms) */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background-dark/80 backdrop-blur-sm p-4">
                    <div className="bg-surface-dark border border-white/10 rounded-2xl shadow-2xl p-6 lg:p-8 w-full max-w-sm flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 rounded-full bg-bittersweet-shimmer/10 flex items-center justify-center mb-6 text-bittersweet-shimmer">
                            <LogOut size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-white-1 mb-2 text-center">{t("sidebar.logoutConfirmTitle")}</h3>
                        <p className="text-sm text-light-gray-70 text-center mb-8">
                            {t("sidebar.logoutConfirmDesc")}
                        </p>
                        <div className="flex w-full gap-3">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 py-2.5 px-4 rounded-lg font-semibold text-light-gray hover:text-white-1 bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                {t("sidebar.cancel")}
                            </button>
                            {/* Wait for actual backend session flush logic later, hard mocked action here */}
                            <form action="/login" method="get" className="flex-1 flex">
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 px-4 rounded-lg font-semibold bg-bittersweet-shimmer hover:bg-bittersweet-shimmer/80 text-white-1 transition-colors shadow-lg shadow-bittersweet-shimmer/20"
                                >
                                    {t("sidebar.logoutConfirmTitle")}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

interface NavItemProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    collapsed: boolean;
    indented?: boolean;
}

function NavItem({ to, icon, label, collapsed, indented = false }: NavItemProps) {
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
}
