import { describe, it, expect, vi } from "vitest";
import { loader } from "./entries.new";
import { getProjects } from "~/services/api/projects/index.server";

vi.mock("~/services/api/projects/index.server", () => ({
    getProjects: vi.fn(),
}));

describe("entries.new route", () => {
    it("redirects to first project when projects exist", async () => {
        (getProjects as any).mockResolvedValue([{ id: 1 }]);
        const result = await loader();
        expect(result).toBeInstanceOf(Response);
        expect(result.headers.get("Location")).toBe("/projects/1/entries/new");
    });

    it("redirects to new project when no projects exist", async () => {
        (getProjects as any).mockResolvedValue([]);
        const result = await loader();
        expect(result).toBeInstanceOf(Response);
        expect(result.headers.get("Location")).toBe("/projects/new");
    });
});
