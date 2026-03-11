import type { Project, BehaviorConfig } from "~/services/api/projects/types";

export interface NewProjectFormProps {
  actionData: any;
  isSubmitting: boolean;
  behaviorConfigs: BehaviorConfig[];
  mode?: "create" | "edit";
  initialData?: Project;
}
