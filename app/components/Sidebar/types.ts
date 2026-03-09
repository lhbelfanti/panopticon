import type { Project } from "~/services/api/projects/types";
import type { User } from "~/services/api/users/types";

export interface SidebarProps {
  projects: Pick<Project, "id" | "name" | "subprojects">[];
  user?: User | null;
}
