import { describe, it, expect, vi, beforeEach } from "vitest";
import { action } from "./logout";

const mockLogout = vi.fn();
const mockGetDataFromSession = vi.fn();

vi.mock("~/services/api/auth/index.server", () => ({
    logout: (...args: any[]) => mockLogout(...args),
}));

vi.mock("~/services/api/auth/session.server", () => ({
    getDataFromSession: (...args: any[]) => mockGetDataFromSession(...args),
}));

describe("Logout Route", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("destroys the session and redirects to /login", async () => {
        mockGetDataFromSession.mockResolvedValue({ token: "mock-token", userId: "1", hasTokenExpired: false });
        mockLogout.mockResolvedValue("session-destroyed-cookie");

        const request = new Request("http://localhost/logout", { method: "POST" });
        const result = await action({ request, params: {}, context: {} } as any) as Response;

        expect(mockGetDataFromSession).toHaveBeenCalledWith(request);
        expect(mockLogout).toHaveBeenCalledWith(request, "mock-token");
        expect(result.status).toBe(302);
        expect(result.headers.get("Location")).toBe("/login");
    });

    it("handles logout when no active session exists", async () => {
        mockGetDataFromSession.mockResolvedValue(null);
        mockLogout.mockResolvedValue("empty-session-cookie");

        const request = new Request("http://localhost/logout", { method: "POST" });
        const result = await action({ request, params: {}, context: {} } as any) as Response;

        expect(mockLogout).toHaveBeenCalledWith(request, undefined);
        expect(result.status).toBe(302);
        expect(result.headers.get("Location")).toBe("/login");
    });
});
