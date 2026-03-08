import type { LoaderFunctionArgs } from "react-router";
import { getPredictionRuns } from "~/services/api/predictions/index.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
    const { id, modelId } = params;
    if (!id || !modelId) throw new Response("Not Found", { status: 404 });

    const predictionRuns = await getPredictionRuns(parseInt(id), modelId);
    return { predictionRuns };
};
