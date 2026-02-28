export type TargetBehavior = "suicidal_ideation" | "depression" | "anxiety" | "harassment" | "hate_speech";
export type MLModel = "bert_spanish" | "roberta_english" | "llama3_zero_shot" | "svm_baseline";

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
