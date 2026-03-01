import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter, MemoryRouter } from "react-router";
import Login from "./login._index";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const mockSubmit = vi.fn();
vi.mock("react-router", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as any),
        Form: ({ children, onSubmit, ...props }: any) => (
            <form onSubmit={(e) => { e.preventDefault(); onSubmit && onSubmit(e); }} {...props}>
                {children}
            </form>
        ),
        useSubmit: () => mockSubmit,
        useNavigation: () => ({
            state: "idle",
            formData: undefined,
            location: undefined,
        }),
        useActionData: () => undefined,
    };
});

describe("Login Route", () => {
    const renderLogin = () => {
        return render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
    };

    it("renders the login layout and default login form", () => {
        renderLogin();

        // Check main branding messages
        const descriptions = screen.getAllByText("login.description");
        expect(descriptions.length).toBeGreaterThan(0);

        // Default view is login form
        expect(screen.getByText("login.signIn")).toBeInTheDocument();
    });

    it("switches to forgot password view", async () => {
        const user = userEvent.setup();
        renderLogin();

        await user.click(screen.getByText("login.forgotPassword"));
        expect(screen.getByText("login.recoverPassword.title")).toBeInTheDocument();
    });

    it("switches to register view", async () => {
        const user = userEvent.setup();
        renderLogin();

        await user.click(screen.getByText("login.registerNow"));
        expect(screen.getByText("login.register.title")).toBeInTheDocument();
    });
});
