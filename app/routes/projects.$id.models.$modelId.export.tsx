import type { LoaderFunctionArgs } from "react-router";
import { getEntries } from "~/services/api/entries/index.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
    const { id, modelId } = params;
    if (!id || !modelId) throw new Response("Not Found", { status: 404 });

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const verdict = url.searchParams.get("verdict") || "";

    // Fetch all records for CSV using a high limit
    const data = await getEntries({
        projectId: id,
        modelId,
        page: 1,
        limit: 10000,
        search,
        verdict: verdict as any
    });

    const csvHeaders = ["ID", "Text", "Verdict", "Score", "CreatedAt"];
    const csvRows = data.entries.map((e) => {
        return [
            e.id,
            `"${e.text.replace(/"/g, '""')}"`, // escape double quotes
            e.verdict,
            e.score ?? "",
            e.createdAt
        ].join(",");
    });

    const csvContent = [csvHeaders.join(","), ...csvRows].join("\n");

    return new Response(csvContent, {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="export_${modelId}_${Date.now()}.csv"`,
        },
    });
};
