import type {
  FilterColumn,
  FilterOperator,
  PaginatedEntries,
} from "~/services/api/entries/types";
import type { Project } from "~/services/api/projects/types";

export interface EntriesTableProps {
  project: Project;
  modelId: string;
  data: PaginatedEntries;
  filterCol: FilterColumn;
  filterVal: string;
  filterOp: FilterOperator;
  filterBias: number;
  // Modal / Selection Support
  isExclusionOnly?: boolean;
  excludedIds?: Set<string>;
  onExcludedIdsChange?: (ids: Set<string>) => void;
}
