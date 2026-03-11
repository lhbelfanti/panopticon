import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { loader, default as ProjectLayout } from "./projects.$id";
import { getProjectById } from "~/services/api/projects/index.server";
import * as reactRouter from "react-router";

vi.mock("~/services/api/projects/index.server");
vi.mock("react-router", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as any),
        useLoaderData: vi.fn(),
        Outlet: vi.fn(({ context }: any) => <div data-testid="outlet" data-context={JSON.stringify(context)} />),
    };
});

describe("ProjectLayout Route", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("loader", () => {
        it("throws 400 for invalid ID", async () => {
            try {
                await loader({ params: { id: "abc" } } as any);
                expect.fail("Should have thrown");
            } catch (err: any) {
                console.log('LOADER ERROR:', err);
                // Check status if it's from data() or a Response
                const status = err.status || err.getResponse?.()?.status;
                expect(status).toBe(400);
            }
        });

        it("throws 404 if project not found", async () => {
            vi.mocked(getProjectById).mockResolvedValue(null);
            try {
                 await loader({ params: { id: "1" } } as any);
                 expect.fail("Should have thrown");
            } catch (err: any) {
                const status = err.status || err.getResponse?.()?.status;
                expect(status).toBe(404);
            }
        });

        it("returns project if found", async () => {
            const mockProject = { id: 1, name: "Test" };
            vi.mocked(getProjectById).mockResolvedValue(mockProject as any);
            const result = await loader({ params: { id: "1" } } as any);
            expect(result).toEqual({ project: mockProject });
        });
    });

    describe("component", () => {
        it("renders Outlet with project context", () => {
            const mockProject = { id: 1, name: "Test" };
            vi.mocked(reactRouter.useLoaderData).mockReturnValue({ project: mockProject });
            
            render(<ProjectLayout />);
            
            expect(reactRouter.useLoaderData).toHaveBeenCalled();
            expect(reactRouter.Outlet).toHaveBeenCalled();
            const firstCall = vi.mocked(reactRouter.Outlet).mock.calls[0];
            expect(firstCall[0]).toEqual(expect.objectContaining({
                context: { project: mockProject }
            }));
        });
    });
});
