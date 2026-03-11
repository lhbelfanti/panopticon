export interface AnalysisTabsProps {
    activeTab: "new" | "history";
    onTabChange: (tab: "new" | "history") => void;
}
