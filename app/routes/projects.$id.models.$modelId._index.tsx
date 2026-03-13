import { useLoaderData, useOutletContext, type MetaFunction } from "react-router";
import { i18next } from "~/localization/i18n.server";
import { useTranslation } from "react-i18next";

import {
  deleteEntry,
  getEntries,
  getPendingCount,
  predictPendingEntries,
  predictSelectedEntries,
} from "~/services/api/entries/index.server";

import EntriesTable from "~/components/EntriesTable";
import { BackButton } from "~/components/ui/BackButton";
import { SubprojectHeader } from "~/components/Project/SubprojectHeader";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import type { ProjectContext } from "~/routes/projects.$id";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `Panopticon - ${data?.title}` },
    {
      name: "description",
      content: "Adverse Human Behaviour Analysis Platform",
    },
  ];
};

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

  if (intent === "predict_selected") {
    const entryIdsStr = formData.get("entryIds");
    if (typeof entryIdsStr === "string") {
      const entryIds = JSON.parse(entryIdsStr) as string[];
      const totalPending = await getPendingCount(parseInt(id), modelId);

      let count = 0;
      if (entryIds.length === totalPending) {
        count = await predictPendingEntries(parseInt(id), modelId);
      } else {
        count = await predictSelectedEntries(parseInt(id), modelId, entryIds);
      }
      return { success: true, count };
    }
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

  const t = await i18next.getFixedT(request);
  const title = t("titles.modelEntries");

  return { modelId, data, filterCol, filterVal, filterOp, filterBias, title };
};

export default function SubprojectEntriesPage() {
  const { modelId, data, filterCol, filterVal, filterOp, filterBias } =
    useLoaderData<typeof loader>();
  const { project } = useOutletContext<ProjectContext>();
  const { t } = useTranslation();

  return (
    <div className="flex-1 p-8 lg:p-12 overflow-y-auto bg-background-dark min-h-screen custom-scrollbar flex flex-col gap-6">
      <div className="max-w-max">
        <BackButton
          to={`/projects/${project.id}`}
          text={t("projects.entries.backToProject")}
        />
      </div>

      <SubprojectHeader
        project={project}
        modelId={modelId}
        description={t("projects.entries.desc")}
      />

      <EntriesTable
        project={project}
        modelId={modelId}
        data={data}
        filterCol={filterCol}
        filterVal={filterVal}
        filterOp={filterOp}
        filterBias={filterBias}
      />
    </div>
  );
}
