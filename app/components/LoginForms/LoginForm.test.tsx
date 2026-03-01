import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router";
import { LoginForm } from "./LoginForm";

vi.mock("react-router", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as any),
        Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    };
});

describe("LoginForm", () => {
    const defaultProps = {
        actionData: undefined,
        isSubmitting: false,
        setView: vi.fn(),
        t: vi.fn((key: string) => key),
    };

    const renderForm = (props = {}) => {
        return render(
            <BrowserRouter>
                <LoginForm {...defaultProps} {...props} />
            </BrowserRouter>
        );
    };

    it("renders login form correctly", () => {
        renderForm();
        expect(screen.getByText("login.signIn")).toBeInTheDocument();
        expect(screen.getByText("login.username")).toBeInTheDocument();
        expect(screen.getByText("login.password")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "login.loginButton" })).toBeInTheDocument();
    });

    it("shows loading state when isSubmitting is true", () => {
        renderForm({ isSubmitting: true });
        expect(screen.getByRole("button", { name: "login.loginButtonLoading" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "login.loginButtonLoading" })).toBeDisabled();
    });

    it("shows error message when actionData has error", () => {
        renderForm({ actionData: { error: "invalid_credentials" } });
        expect(screen.getByText("login.errors.invalid_credentials")).toBeInTheDocument();
    });

    it("calls setView('forgot') when forgot password is clicked", async () => {
        const user = userEvent.setup();
        const setViewMock = vi.fn();
        renderForm({ setView: setViewMock });

        await user.click(screen.getByText("login.forgotPassword"));
        expect(setViewMock).toHaveBeenCalledWith("forgot");
    });

    it("calls setView('register') when register is clicked", async () => {
        const user = userEvent.setup();
        const setViewMock = vi.fn();
        renderForm({ setView: setViewMock });

        await user.click(screen.getByText("login.registerNow"));
        expect(setViewMock).toHaveBeenCalledWith("register");
    });
});
