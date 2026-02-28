import { useState } from 'react';
import { NavLink } from 'react-router';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
    ChevronLeft,
    ChevronRight,
    Home,
    PlusCircle,
    CopyPlus,
    Folder,
    LogOut,
    UserCircle,
    LibraryBig
} from 'lucide-react';
import type { SidebarProps } from './types';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function Sidebar({ projects }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);

    const toggleSidebar = () => setCollapsed(!collapsed);

    return (
        <aside
            className={cn(
                "flex flex-col bg-sidebar-dark text-light-gray h-screen transition-all duration-300 border-r border-white/5 shadow-2xl relative",
                collapsed ? "w-20" : "w-72"
            )}
        >
            {/* Collapse Toggle (Absolute positioning behind/near logo area on the right edge) */}
            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-8 bg-surface-dark hover:bg-primary border border-white/5 text-light-gray hover:text-background-dark rounded-full p-1 shadow-lg transition-colors z-50 flex items-center justify-center"
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Header / Logo Component */}
            <div className="flex items-center justify-center p-6 border-b border-white/5 min-h-[5rem]">
                <div className={cn("flex items-center justify-center w-full transition-all duration-300")}>
                    {collapsed ? (
                        <img src="/panopticon-logo-no-text.png" alt="Panopticon" className="w-10 h-auto drop-shadow-md" />
                    ) : (
                        <img src="/panopticon-logo.png" alt="Panopticon" className="w-40 h-auto drop-shadow-md" />
                    )}
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 py-6 flex flex-col gap-8 custom-scrollbar relative z-10 overflow-y-auto overflow-x-hidden p-3">

                {/* Home / Core */}
                <div className="flex flex-col gap-1.5">
                    <NavItem
                        to="/"
                        icon={<Home size={20} className="text-light-gray hover:text-primary transition-colors" />}
                        label="Home"
                        collapsed={collapsed}
                    />
                </div>

                {/* Acciones Rápidas */}
                <div className="flex flex-col gap-1.5">
                    {!collapsed && (
                        <h3 className="px-3 text-[0.65rem] font-bold text-light-gray-70 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            <PlusCircle size={12} className="opacity-50" />
                            Acciones Rápidas
                        </h3>
                    )}
                    <NavItem
                        to="/entries/new"
                        icon={<CopyPlus size={18} className="text-primary/70 group-hover:text-primary transition-colors" />}
                        label="Nueva Entrada (Predicción)"
                        collapsed={collapsed}
                        indented={!collapsed}
                    />
                    <NavItem
                        to="/projects/new"
                        icon={<LibraryBig size={18} className="text-primary/70 group-hover:text-primary transition-colors" />}
                        label="Nuevo Proyecto"
                        collapsed={collapsed}
                        indented={!collapsed}
                    />
                </div>

                {/* Tus Proyectos */}
                <div className="flex flex-col gap-1.5">
                    {!collapsed && (
                        <h3 className="px-3 text-[0.65rem] font-bold text-light-gray-70 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            <LibraryBig size={12} className="opacity-50" />
                            Tus Proyectos
                        </h3>
                    )}
                    {projects.map((project) => (
                        <NavItem
                            key={project.id}
                            to={`/projects/${project.id}`}
                            icon={<Folder size={18} className="text-light-gray-70 group-hover:text-white-1 transition-colors" />}
                            label={project.name}
                            collapsed={collapsed}
                            indented={!collapsed}
                        />
                    ))}
                    {projects.length === 0 && !collapsed && (
                        <div className="px-8 py-2 text-xs text-light-gray-70 italic">
                            No hay proyectos activos
                        </div>
                    )}
                </div>
            </nav>

            {/* Footer / User Settings */}
            <div className="mt-auto border-t border-white/5 p-4 bg-black/20">
                <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between gap-3")}>
                    <div className={cn("flex items-center gap-3 overflow-hidden", collapsed && "justify-center")}>
                        <div className="flex-shrink-0 bg-surface-dark rounded-full p-2 border border-white/5 shadow-inner">
                            <UserCircle size={24} className="text-light-gray group-hover:text-white-1" />
                        </div>
                        {!collapsed && (
                            <div className="flex flex-col min-w-0 pr-2">
                                <span className="text-sm font-semibold text-white-1 leading-tight truncate">Administrador</span>
                                <span className="text-xs text-light-gray-70 truncate">Tesis de Grado</span>
                            </div>
                        )}
                    </div>
                    {!collapsed && (
                        <button className="flex-shrink-0 text-light-gray-70 hover:text-primary transition-colors p-2 rounded-lg hover:bg-surface-dark" title="Cerrar sesión">
                            <LogOut size={18} />
                        </button>
                    )}
                </div>
            </div>
        </aside>
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
                        ? "bg-surface-dark text-white-1 font-medium shadow-sm border border-white/5"
                        : "text-light-gray hover:bg-white/5 hover:text-white-1 hover:translate-x-1"
                )
            }
            title={collapsed ? label : undefined}
        >
            {({ isActive }) => (
                <>
                    {/* Active Indicator Line (Desktop only) */}
                    {isActive && !collapsed && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-2/3 bg-primary rounded-r-md" />
                    )}

                    <div className={cn("flex-shrink-0 flex items-center justify-center", isActive && "[&>svg]:text-primary")}>
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
