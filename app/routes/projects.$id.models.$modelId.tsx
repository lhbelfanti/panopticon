import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { getEntries, deleteEntry } from "~/services/api/entries/index.server";
import { getProjectById } from "~/services/api/projects/index.server";
import type { EntryVerdict } from "~/services/api/entries/types";

export const meta = () => [
    { title: "Panopticon" }
];

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const { id, modelId } = params;
    if (!id || !modelId) throw new Response("Not Found", { status: 404 });

    const formData = await request.formData();
    const intent = formData.get("intent");
    const entryId = formData.get("entryId");

    if (intent === "delete_entry" && typeof entryId === "string") {
        await deleteEntry(id, modelId, entryId);
        return null;
    }

    return null;
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
    const { id, modelId } = params;
    if (!id || !modelId) throw new Response("Not Found", { status: 404 });
    const project = await getProjectById(id);
    if (!project) throw new Response("Not Found", { status: 404 });

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const verdict = url.searchParams.get("verdict") || "";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = 10;

    const data = await getEntries({
        projectId: id,
        modelId,
        page,
        limit,
        search,
        verdict: verdict as EntryVerdict | ""
    });

    return { project, modelId, data, search, verdict };
};

import EntriesTable from "~/components/EntriesTable";

const SubprojectEntriesPage = () => {
    const { project, modelId, data, search, verdict } = useLoaderData<typeof loader>();

    return (
        <EntriesTable
            project={project}
            modelId={modelId}
            data={data}
            search={search}
            verdict={verdict}
        />
    );
};

export default SubprojectEntriesPage;
