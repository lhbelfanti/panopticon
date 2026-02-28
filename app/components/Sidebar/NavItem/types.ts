export interface NavItemProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    collapsed: boolean;
    indented?: boolean;
}
