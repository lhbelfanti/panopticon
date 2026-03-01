import type { Project } from "~/services/api/projects/types";
import type { User } from "~/services/api/users/types";

export interface SidebarProps {
  projects: Project[];
  user?: User | null;
}
