export type TargetBehavior =
  | "illicit_drugs"
  | "hate_speech"
  | "cyberbullying"
  | "sexism"
  | "suicidal_ideation_depression"
  | "eating_disorders";
export type MLModel =
  | "bert_spanish"
  | "roberta_english"
  | "llama3_zero_shot"
  | "svm_baseline";

export interface BehaviorConfig {
  id: TargetBehavior;
  enabled: boolean;
  availableModels: MLModel[];
  colorClass: string;
  bgClass: string;
  iconName: string;
}

export interface Subproject {
  id: string;
  model: MLModel;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  behaviors: TargetBehavior[];
  models: MLModel[];
  subprojects: Subproject[];
  createdAt: string;
}

export interface CreateProjectDTO {
  name: string;
  description?: string;
  behaviors: TargetBehavior[];
  models: MLModel[];
}
