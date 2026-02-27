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

export async function getProjects(): Promise<Project[]> {
    // Artificial delay between 500ms and 1s
    await delay(Math.floor(Math.random() * 500) + 500);
    return [...projects];
}

export async function createProject(data: CreateProjectDTO): Promise<Project> {
    await delay(Math.floor(Math.random() * 500) + 500);

    const newProject: Project = {
        id: `proj_${Date.now()}`,
        name: data.name,
        description: data.description,
        createdAt: new Date().toISOString(),
    };

    projects.push(newProject);
    return newProject;
}

export async function getProjectById(id: string): Promise<Project | null> {
    await delay(Math.floor(Math.random() * 500) + 500);
    const project = projects.find(p => p.id === id);
    return project || null;
}
