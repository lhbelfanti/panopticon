import { describe, it, expect, vi } from "vitest";
import { loader } from "./projects.$id.models.$modelId.predictions";
import { getPredictionRuns } from "~/services/api/predictions/index.server";

vi.mock("~/services/api/predictions/index.server", () => ({
    getPredictionRuns: vi.fn(),
}));

describe("predictions resource route loader", () => {
    it("throws 404 if id or modelId is missing", async () => {
        try {
            await loader({ params: {}, request: new Request("http://localhost") } as any);
            expect.fail("Should have thrown");
        } catch (e: any) {
            expect(e).toBeInstanceOf(Response);
            expect(e.status).toBe(404);
        }
    });

    it("returns prediction runs successfully", async () => {
        const mockRuns = [{ id: "run_1" }];
        vi.mocked(getPredictionRuns).mockResolvedValue(mockRuns as any);

        const result = await loader({
            params: { id: "1", modelId: "roberta" },
            request: new Request("http://localhost")
        } as any);

        expect(result).toEqual({ predictionRuns: mockRuns });
        expect(getPredictionRuns).toHaveBeenCalledWith(1, "roberta");
    });
});
