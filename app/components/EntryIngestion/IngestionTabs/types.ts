export interface IngestionTabsProps {
    activeTab: "single" | "bulk";
    onTabChange: (tab: "single" | "bulk") => void;
}
