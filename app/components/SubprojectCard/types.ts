import type { Subproject } from "~/services/api/projects/types";

export interface SubprojectCardProps {
  subproject: Subproject;
  projectId: string;
}
