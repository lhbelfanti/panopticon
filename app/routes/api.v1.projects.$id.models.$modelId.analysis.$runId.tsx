import { data } from "react-router";
import { getAnalysisRunById } from "~/services/api/analysis/index.server";
import type { LoaderFunctionArgs } from "react-router";

export const loader = async ({ params }: LoaderFunctionArgs) => {
    const { runId } = params;
    if (!runId) {
        throw data("Missing runId", { status: 400 });
    }

    const run = await getAnalysisRunById(runId);
    if (!run) {
        throw data("Analysis run not found", { status: 404 });
    }

    return run;
};
