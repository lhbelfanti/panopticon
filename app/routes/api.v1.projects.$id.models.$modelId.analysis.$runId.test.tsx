import { describe, it, expect, vi } from "vitest";
import { loader } from "./api.v1.projects.$id.models.$modelId.analysis.$runId";
import { getAnalysisRunById } from "~/services/api/analysis/index.server";

vi.mock("~/services/api/analysis/index.server", () => ({
    getAnalysisRunById: vi.fn(),
}));

describe("Analysis Run API Loader", () => {
    it("returns the analysis run for a valid runId", async () => {
        const mockRun = { id: "run_1", status: "completed" };
        vi.mocked(getAnalysisRunById).mockResolvedValue(mockRun as any);

        const result = await loader({ params: { runId: "run_1" } } as any);
        expect(result).toEqual(mockRun);
        expect(getAnalysisRunById).toHaveBeenCalledWith("run_1");
    });

    it("throws 400 if runId is missing", async () => {
        try {
            await loader({ params: {} } as any);
        } catch (error: any) {
            expect(error.init.status).toBe(400);
        }
    });

    it("throws 404 if analysis run is not found", async () => {
        vi.mocked(getAnalysisRunById).mockResolvedValue(null);
        try {
            await loader({ params: { runId: "not_found" } } as any);
        } catch (error: any) {
            expect(error.init.status).toBe(404);
        }
    });
});
