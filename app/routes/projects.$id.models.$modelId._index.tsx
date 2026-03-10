import { useLoaderData, useOutletContext } from "react-router";

import {
  deleteEntry,
  getEntries,
  predictPendingEntries,
} from "~/services/api/entries/index.server";

import EntriesTable from "~/components/EntriesTable";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import type { EntryVerdict } from "~/services/api/entries/types";
import type { ProjectContext } from "~/routes/projects.$id";

export const meta = () => [{ title: "Panopticon" }];

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { id, modelId } = params;
  if (!id || !modelId) throw new Response("Not Found", { status: 404 });

  const formData = await request.formData();
  const intent = formData.get("intent");
  const entryId = formData.get("entryId");

  if (intent === "delete_entry" && typeof entryId === "string") {
    await deleteEntry(parseInt(id), modelId, entryId);
    return null;
  }

  if (intent === "predict_pending") {
    const count = await predictPendingEntries(parseInt(id), modelId);
    return { success: true, count };
  }

  return null;
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { id, modelId } = params;
  if (!id || !modelId) throw new Response("Not Found", { status: 404 });

  const url = new URL(request.url);
  const filterCol = (url.searchParams.get("filterCol") || "id") as any;
  const filterVal = url.searchParams.get("filterVal") || "";
  const filterOp = (url.searchParams.get("filterOp") || "") as any;
  const filterBias = parseFloat(url.searchParams.get("filterBias") || "0");
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = 10;

  const data = await getEntries({
    projectId: parseInt(id),
    modelId,
    page,
    limit,
    filterCol,
    filterVal,
    filterOp,
    filterBias,
  });

  return { modelId, data, filterCol, filterVal, filterOp, filterBias };
};

export default function SubprojectEntriesPage() {
  const { modelId, data, filterCol, filterVal, filterOp, filterBias } =
    useLoaderData<typeof loader>();
  const { project } = useOutletContext<ProjectContext>();

  return (
    <EntriesTable
      project={project}
      modelId={modelId}
      data={data}
      filterCol={filterCol}
      filterVal={filterVal}
      filterOp={filterOp}
      filterBias={filterBias}
    />
  );
}
