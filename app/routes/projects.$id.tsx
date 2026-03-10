import { Outlet, useLoaderData, data } from "react-router";
import { getProjectById } from "~/services/api/projects/index.server";
import type { Project } from "~/services/api/projects/types";

export const loader = async ({ params }: { params: { id: string } }) => {
    const projectId = parseInt(params.id);
    if (isNaN(projectId)) {
        throw data("Invalid project ID", { status: 400 });
    }

    const project = await getProjectById(projectId);
    if (!project) {
        throw data("Project not found", { status: 404 });
    }

    return { project };
};

export default function ProjectLayout() {
    const { project } = useLoaderData<typeof loader>();
    return <Outlet context={{ project }} />;
}

export type ProjectContext = {
    project: Project;
};
