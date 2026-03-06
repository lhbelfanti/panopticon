import { Link } from "react-router";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export interface BreadcrumbItem {
    label: string;
    to?: string;
    icon?: ReactNode;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export const Breadcrumb = ({ items, className = "" }: BreadcrumbProps) => {
    return (
        <nav className={`flex items-center gap-3 text-light-gray-50 font-medium ${className}`}>
            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                const content = (
                    <div className={`flex items-center gap-2 transition-colors text-3xl font-extrabold tracking-tight ${isLast ? 'text-yellow-400' : 'text-white-1 hover:text-yellow-400'}`}>
                        {item.icon && <span className="text-primary flex items-center">{item.icon}</span>}
                        <span>{item.label}</span>
                    </div>
                );

                return (
                    <div key={index} className="flex items-center gap-3">
                        {index > 0 && <span className="opacity-50 text-light-gray-50 flex items-center">/</span>}
                        {item.to && !isLast ? (
                            <Link to={item.to} className="transition-colors">
                                {content}
                            </Link>
                        ) : (
                            content
                        )}
                    </div>
                );
            })}
        </nav>
    );
};

export default Breadcrumb;
