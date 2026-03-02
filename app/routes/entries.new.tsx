import { redirect } from "react-router";
import { getProjects } from "~/services/api/projects/index.server";

export const loader = async () => {
    const projects = await getProjects();
    if (projects.length > 0) {
        return redirect(`/projects/${projects[0].id}/entries/new`);
    }
    return redirect("/projects/new");
};

export default function EntriesNewRedirect() {
    return null;
}
