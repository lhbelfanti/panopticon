import { useState } from 'react';
import { Link, NavLink } from 'react-router';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronLeft, ChevronRight, PlusCircle, FileText, Folder, LayoutDashboard } from 'lucide-react';
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
                "flex flex-col bg-onyx text-light-gray h-screen transition-all duration-300 border-r border-[var(--color-eerie-black-1)]",
                collapsed ? "w-20" : "w-64"
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-eerie-black-1)] h-16">
                <div className={cn("flex items-center gap-3 overflow-hidden", collapsed && "justify-center")}>
                    <div className="flex-shrink-0 w-8 h-8 bg-bittersweet-shimmer rounded-lg flex items-center justify-center font-bold text-white-1">
                        P
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col min-w-0">
                            <span className="font-bold text-white-1 leading-tight truncate">Panopticon</span>
                            <span className="text-xs opacity-70 truncate">AHB Analysis</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-6">

                {/* Main */}
                <div className="px-3 flex flex-col gap-1">
                    <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" collapsed={collapsed} />
                </div>

                {/* Acciones Rápidas */}
                <div className="px-3 flex flex-col gap-1">
                    {!collapsed && (
                        <h3 className="px-2 text-xs font-semibold opacity-70 uppercase tracking-wider mb-2">
                            Acciones Rápidas
                        </h3>
                    )}
                    <NavItem to="/entries/new" icon={<PlusCircle size={20} />} label="Nueva Entrada" collapsed={collapsed} />
                    <NavItem to="/projects/new" icon={<FileText size={20} />} label="Nuevo Proyecto" collapsed={collapsed} />
                </div>

                {/* Tus Proyectos */}
                <div className="px-3 flex flex-col gap-1">
                    {!collapsed && (
                        <h3 className="px-2 text-xs font-semibold opacity-70 uppercase tracking-wider mb-2 flex justify-between items-center">
                            <span>Tus Proyectos</span>
                        </h3>
                    )}
                    {projects.map((project) => (
                        <NavItem
                            key={project.id}
                            to={`/projects/${project.id}`}
                            icon={<Folder size={20} />}
                            label={project.name}
                            collapsed={collapsed}
                        />
                    ))}
                </div>
            </nav>

            {/* Footer / Toggle */}
            <div className="p-4 border-t border-[var(--color-eerie-black-1)]">
                <button
                    onClick={toggleSidebar}
                    className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-[var(--color-eerie-black-1)] opacity-70 hover:opacity-100 hover:text-white-1 transition-colors"
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>
        </aside>
    );
}

interface NavItemProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    collapsed: boolean;
}

function NavItem({ to, icon, label, collapsed }: NavItemProps) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                cn(
                    "flex items-center rounded-lg p-2 transition-colors group",
                    collapsed ? "justify-center" : "justify-start gap-3",
                    isActive
                        ? "bg-[var(--color-eerie-black-1)] text-white-1 font-medium"
                        : "text-light-gray hover:bg-jet hover:text-white-1"
                )
            }
            title={collapsed ? label : undefined}
        >
            <div className="flex-shrink-0">{icon}</div>
            {!collapsed && <span className="truncate">{label}</span>}
        </NavLink>
    );
}
