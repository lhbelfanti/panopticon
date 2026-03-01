import { describe, it, expect, vi } from "vitest";
import { loader } from "./projects.$id.models.$modelId.export";

// Mock the backend API calls
vi.mock("~/services/api/entries/index.server", () => ({
    getEntries: vi.fn().mockResolvedValue({
        entries: [
            {
                id: "entry_1",
                text: 'This is a "test" entry', // includes double quotes to test escaping
                verdict: "Positive",
                score: 0.95,
                datasetId: "ds-1",
                modelId: "roberta",
                createdAt: "2024-01-01T00:00:00Z"
            },
            {
                id: "entry_2",
                text: "Another entry",
                verdict: "Pending",
                score: undefined,
                datasetId: "ds-1",
                modelId: "roberta",
                createdAt: "2024-01-02T00:00:00Z"
            },
        ],
        total: 2,
        page: 1,
        limit: 10000,
        totalPages: 1,
    })
}));

describe("Export Route Loader", () => {
    it("should return a CSV response with expected content", async () => {
        const url = new URL("http://localhost/projects/1/models/roberta/export");
        const request = new Request(url);
        const params = { id: "1", modelId: "roberta" };

        const response = await loader({ request, params, context: {} } as any);

        expect(response).toBeInstanceOf(Response);
        expect(response.headers.get("Content-Type")).toBe("text/csv; charset=utf-8");
        expect(response.headers.get("Content-Disposition")).toBe('attachment; filename="export_roberta_1_1.csv"');

        const text = await response.text();
        const lines = text.split("\n");

        // Header
        expect(lines[0]).toBe("ID,Text,Verdict,Score,CreatedAt");

        // Data rows
        // It should escape double quotes with double-double quotes and enclose in double quotes
        expect(lines[1]).toBe('entry_1,"This is a ""test"" entry",Positive,0.95,2024-01-01T00:00:00Z');
        expect(lines[2]).toBe('entry_2,"Another entry",Pending,,2024-01-02T00:00:00Z');
    });

    it("should throw 404 if missing params", async () => {
        const url = new URL("http://localhost/projects/export");
        const request = new Request(url);

        try {
            await loader({ request, params: {}, context: {} } as any);
            expect.fail("Should throw");
        } catch (e: any) {
            expect(e).toBeInstanceOf(Response);
            expect(e.status).toBe(404);
        }
    });
});
