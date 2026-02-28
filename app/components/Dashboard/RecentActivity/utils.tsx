import { Folder, FileText, Activity } from "lucide-react";

export const ActivityIcon = (props: { type: string }) => {
    const { type } = props;
    switch (type) {
        case 'project_created': return <Folder size={14} />;
        case 'csv_uploaded':
        case 'tweets_added': return <FileText size={14} />;
        case 'predictions_made': return <Activity size={14} />;
        default: return <Activity size={14} />;
    }
};

export const getActivityColor = (type: string): string => {
    switch (type) {
        case 'project_created': return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
        case 'csv_uploaded':
        case 'tweets_added': return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
        case 'predictions_made': return "bg-primary/10 text-primary border border-primary/20";
        default: return "bg-gray-500/10 text-gray-400 border border-gray-500/20";
    }
};
