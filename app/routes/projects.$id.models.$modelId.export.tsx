import { getEntries } from "~/services/api/entries/index.server";

import type { LoaderFunctionArgs } from "react-router";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { id, modelId } = params;
  if (!id || !modelId) throw new Response("Not Found", { status: 404 });

  const url = new URL(request.url);
  const filterCol = (url.searchParams.get("filterCol") || "id") as any;
  const filterVal = url.searchParams.get("filterVal") || "";
  const filterOp = (url.searchParams.get("filterOp") || "") as any;
  const filterBias = parseFloat(url.searchParams.get("filterBias") || "0");

  // Fetch all records for CSV using a high limit
  const data = await getEntries({
    projectId: parseInt(id),
    modelId,
    page: 1,
    limit: 10000,
    filterCol,
    filterVal,
    filterOp,
    filterBias,
  });

  const csvHeaders = ["id", "text", "verdict", "score", "created_at"];
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Enqueue header row
      controller.enqueue(encoder.encode(csvHeaders.join(",") + "\n"));

      // Stream each entry row individually
      for (const e of data.entries) {
        const row = [
          e.id,
          `"${e.text.replace(/"/g, '""')}"`, // escape double quotes
          e.verdict,
          e.score ?? "",
          e.createdAt,
        ].join(",");
        controller.enqueue(encoder.encode(row + "\n"));
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="export_${modelId.replace(/-/g, '_')}_${id}_1.csv"`,
    },
  });
};
