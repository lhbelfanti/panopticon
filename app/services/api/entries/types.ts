export type EntryVerdict = "Pending" | "In Progress" | "Positive" | "Negative" | "Error";
export type SocialMediaType = "twitter"; // Extensible for future platforms

export interface TwitterMetadata {
  date?: string;
  isReply: boolean;
  hasQuote: boolean;
  quotedText?: string;
  isQuoteAReply?: boolean;
}

export interface Entry {
  id: string;
  projectId: number; // The parent project ID
  modelId: string; // The subproject model reference
  text: string;
  verdict: EntryVerdict;
  score?: number; // Added for prediction scores
  socialMediaType?: SocialMediaType;
  metadata?: TwitterMetadata | any; // Type narrows based on socialMediaType
  createdAt: string;
}

export type FilterColumn = "id" | "text" | "verdict" | "score";
export type FilterOperator = ">" | "<" | ">=" | "<=" | "=" | "~=" | "";

export interface GetEntriesParams {
  projectId: number;
  modelId: string;
  page?: number;
  limit?: number;
  filterCol?: FilterColumn;
  filterVal?: string;
  filterOp?: FilterOperator;
  filterBias?: number;
}

export interface PaginatedEntries {
  entries: Entry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
