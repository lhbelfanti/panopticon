import type { BehaviorConfig } from "~/services/api/projects/types";

export interface NewProjectFormProps {
  actionData: { error?: string } | undefined;
  isSubmitting: boolean;
  behaviorConfigs: BehaviorConfig[];
  mode?: "create" | "edit";
  initialData?: {
    name: string;
    description: string;
    behaviors: string[];
    models: string[];
  };
}
