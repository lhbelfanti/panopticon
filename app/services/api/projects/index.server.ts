import type { Project, CreateProjectDTO } from './types';

// Stateful in-memory mock store
let projects: Project[] = [
    {
        id: 'proj_1',
        name: 'Default',
        description: 'Default project for all uncategorized analysis',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'proj_2',
        name: 'Suicidal Ideation Study',
        description: 'Analyzing posts related to depression and suicidal thoughts',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
    }
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getProjects = async (): Promise<Project[]> => {
    await delay(1000); // Simulate network delay
    return [...projects];
};

export const createProject = async (data: CreateProjectDTO): Promise<Project> => {
    await delay(800); // Simulate network delay

    const newProject: Project = {
        id: crypto.randomUUID(),
        name: data.name, // Assuming 'name' is still the field, not 'title' as in the example snippet
        description: data.description,
        // The snippet added 'status' and 'updatedAt', but these are not in the original Project type.
        // I will keep the original Project type structure for now, assuming the user will update types if needed.
        createdAt: new Date().toISOString(),
    };

    projects.push(newProject);
    return newProject;
};

export const getProjectById = async (id: string): Promise<Project | null> => {
    await delay(500); // Simulate network delay
    return projects.find(p => p.id === id) || null;
};
