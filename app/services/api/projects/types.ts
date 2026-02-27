export interface Project {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
}

export type CreateProjectDTO = Pick<Project, 'name' | 'description'>;
