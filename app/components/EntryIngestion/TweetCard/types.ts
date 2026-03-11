import type { TwitterMetadata } from "~/services/api/entries/types";

export interface TweetCardProps {
    mode: "readOnly" | "interactive";
    initialData?: {
        text: string;
        metadata: TwitterMetadata;
    };
    onChange?: (data: { text: string; metadata: TwitterMetadata }) => void;
}
