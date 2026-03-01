import type { BehaviorConfig, CreateProjectDTO, Project } from "./types";

// Stateful in-memory mock store
let projects: Project[] = [
  {
    id: "proj_1",
    name: "Default Analysis",
    description: "Default project for all uncategorized analysis",
    behaviors: ["suicidal_ideation_depression", "hate_speech"],
    models: ["bert_spanish", "roberta_english"],
    subprojects: [
      {
        id: "proj_1_bert_spanish",
        model: "bert_spanish",
        createdAt: new Date().toISOString(),
      },
      {
        id: "proj_1_roberta_english",
        model: "roberta_english",
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "proj_2",
    name: "Mental Health Cohort A",
    description: "Analyzing posts related to depression and suicidal thoughts",
    behaviors: ["suicidal_ideation_depression"],
    models: ["llama3_zero_shot"],
    subprojects: [
      {
        id: "proj_2_llama3_zero_shot",
        model: "llama3_zero_shot",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getProjects = async (): Promise<Project[]> => {
  await delay(1000); // Simulate network delay
  return [...projects];
};

export const createProject = async (
  data: CreateProjectDTO,
): Promise<Project> => {
  await delay(800); // Simulate network delay

  const projectId = crypto.randomUUID();
  const newProject: Project = {
    id: projectId,
    name: data.name,
    description: data.description,
    behaviors: data.behaviors || [],
    models: data.models || [],
    subprojects: (data.models || []).map((model) => ({
      id: `${projectId}_${model}`,
      model,
      createdAt: new Date().toISOString(),
    })),
    createdAt: new Date().toISOString(),
  };

  projects.push(newProject);
  return newProject;
};

export const getProjectById = async (id: string): Promise<Project | null> => {
  await delay(500); // Simulate network delay
  return projects.find((p) => p.id === id) || null;
};

export const deleteProject = async (id: string): Promise<boolean> => {
  await delay(600);
  const initialLen = projects.length;
  projects = projects.filter((p) => p.id !== id);
  return projects.length < initialLen;
};

export const BEHAVIOR_CONFIGS: BehaviorConfig[] = [
  {
    id: "illicit_drugs",
    enabled: true,
    availableModels: ["bert_spanish", "llama3_zero_shot"],
    colorClass: "text-red-400",
    bgClass: "bg-red-400/10",
    iconName: "Pill",
  },
  {
    id: "hate_speech",
    enabled: true,
    availableModels: ["bert_spanish", "roberta_english", "svm_baseline"],
    colorClass: "text-orange-400",
    bgClass: "bg-orange-400/10",
    iconName: "MessageSquareWarning",
  },
  {
    id: "cyberbullying",
    enabled: true,
    availableModels: ["roberta_english", "llama3_zero_shot"],
    colorClass: "text-purple-400",
    bgClass: "bg-purple-400/10",
    iconName: "UserMinus",
  },
  {
    id: "sexism",
    enabled: false,
    availableModels: [],
    colorClass: "text-pink-400",
    bgClass: "bg-pink-400/10",
    iconName: "Scale",
  },
  {
    id: "suicidal_ideation_depression",
    enabled: true,
    availableModels: ["bert_spanish", "llama3_zero_shot", "svm_baseline"],
    colorClass: "text-blue-400",
    bgClass: "bg-blue-400/10",
    iconName: "HeartCrack",
  },
  {
    id: "eating_disorders",
    enabled: false,
    availableModels: [],
    colorClass: "text-teal-400",
    bgClass: "bg-teal-400/10",
    iconName: "UtensilsCrossed",
  },
];

export const getBehaviorsConfig = async (): Promise<BehaviorConfig[]> => {
  await delay(300);
  return BEHAVIOR_CONFIGS;
};
