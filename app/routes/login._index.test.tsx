import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter, MemoryRouter } from "react-router";
import Login from "./login._index";

vi.mock("react-i18next", () => ({
    Trans: ({ i18nKey, children }: any) => children || i18nKey,
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
    it("switches back to login from register view", async () => {
        const user = userEvent.setup();
        renderLogin();

        await user.click(screen.getByText("login.registerNow"));
        expect(screen.getByText("login.register.title")).toBeInTheDocument();

        await user.click(screen.getByText("login.register.loginHere"));
        expect(screen.getByText("login.signIn")).toBeInTheDocument();
    });

    it("switches back to login from forgot password view", async () => {
        const user = userEvent.setup();
        renderLogin();

        await user.click(screen.getByText("login.forgotPassword"));
        expect(screen.getByText("login.recoverPassword.title")).toBeInTheDocument();

        await user.click(screen.getByText("login.recoverPassword.backToLogin"));
        expect(screen.getByText("login.signIn")).toBeInTheDocument();
    });
});

import { action } from "./login._index";

vi.mock("~/services/api/auth/index.server", () => ({
    login: vi.fn(async ({ username }) => {
        if (username === "valid") {
            return {
                user: { id: 1, name: "Test" },
                headers: { "Set-Cookie": "session=abc" }
            };
        }
        throw new Error("failed");
    }),
    signup: vi.fn(async ({ email }) => {
        if (email === "valid@example.com") {
            return { signupSuccess: true };
        }
        throw new Error("failed");
    }),
    requestPasswordReset: vi.fn(async (email) => {
        if (email === "valid@example.com") {
            return { resetSuccess: true };
        }
        throw new Error("failed");
    })
}));

describe("Login Route Functions", () => {
    it("action validates username", async () => {
        const formData = new FormData();
        const request = new Request("http://localhost/login", {
            method: "POST",
            body: formData,
        });

        const result = await action({ request });
        expect(result).toEqual({ error: "usernameRequired" });
    });

    it("action handles successful login", async () => {
        const formData = new FormData();
        formData.set("username", "valid");
        formData.set("password", "password");
        const request = new Request("http://localhost/login", {
            method: "POST",
            body: formData,
        });

        const result = await action({ request }) as Response;
        expect(result.status).toBe(302);
        expect(result.headers.get("Location")).toBe("/");
    });

    it("action handles login failure", async () => {
        const formData = new FormData();
        formData.set("username", "invalid");
        formData.set("password", "password");
        const request = new Request("http://localhost/login", {
            method: "POST",
            body: formData,
        });

        const result = await action({ request });
        expect(result).toEqual({ error: "loginFailed" });
    });

    it("action handles signup intent success", async () => {
        const formData = new FormData();
        formData.set("intent", "signup");
        formData.set("reg-email", "valid@example.com");
        const request = new Request("http://localhost/login", {
            method: "POST",
            body: formData,
        });

        const result = await action({ request });
        expect(result).toEqual({ signupSuccess: true });
    });

    it("action handles signup intent failure", async () => {
        const formData = new FormData();
        formData.set("intent", "signup");
        formData.set("reg-email", "invalid@example.com");
        const request = new Request("http://localhost/login", {
            method: "POST",
            body: formData,
        });

        const result = await action({ request });
        expect(result).toEqual({ error: "signupFailed" });
    });

    it("action handles forgot_password intent success", async () => {
        const formData = new FormData();
        formData.set("intent", "forgot_password");
        formData.set("reset-email", "valid@example.com");
        const request = new Request("http://localhost/login", {
            method: "POST",
            body: formData,
        });

        const result = await action({ request });
        expect(result).toEqual({ resetSuccess: true });
    });

    it("action handles forgot_password intent failure", async () => {
        const formData = new FormData();
        formData.set("intent", "forgot_password");
        formData.set("reset-email", "invalid@example.com");
        const request = new Request("http://localhost/login", {
            method: "POST",
            body: formData,
        });

        const result = await action({ request });
        expect(result).toEqual({ error: "resetFailed" });
    });

    it("action validates email for signup", async () => {
        const formData = new FormData();
        formData.set("intent", "signup");
        const request = new Request("http://localhost/login", {
            method: "POST",
            body: formData,
        });

        const result = await action({ request });
        expect(result).toEqual({ error: "emailRequired" });
    });

    it("action validates email for forgot_password", async () => {
        const formData = new FormData();
        formData.set("intent", "forgot_password");
        const request = new Request("http://localhost/login", {
            method: "POST",
            body: formData,
        });

        const result = await action({ request });
        expect(result).toEqual({ error: "emailRequired" });
    });
});

import { meta } from "./login._index";

describe("Login Route Meta", () => {
    it("returns expected meta tags", () => {
        const result = meta();
        expect(result).toContainEqual({ title: "Panopticon" });
        expect(result).toContainEqual(expect.objectContaining({ name: "description" }));
    });
});
