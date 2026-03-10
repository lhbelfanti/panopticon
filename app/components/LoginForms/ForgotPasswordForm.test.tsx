import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

vi.mock("react-router", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as any),
        Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    };
});

describe("ForgotPasswordForm", () => {
    const defaultProps = {
        setView: vi.fn(),
        t: vi.fn((key: string) => key),
        actionData: undefined,
        isSubmitting: false,
    };

    const renderForm = () => render(
        <BrowserRouter>
            <ForgotPasswordForm {...defaultProps} />
        </BrowserRouter>
    );

    it("renders forgot password form correctly", () => {
        renderForm();
        expect(screen.getByText("login.recoverPassword.title")).toBeInTheDocument();
        expect(screen.getByText("login.email")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "login.recoverPassword.sendLink" })).toBeInTheDocument();
    });

    it("calls setView('login') when back button is clicked", async () => {
        const user = userEvent.setup();
        const setViewMock = vi.fn();
        render(
            <BrowserRouter>
                <ForgotPasswordForm t={defaultProps.t} setView={setViewMock} actionData={undefined} isSubmitting={false} />
            </BrowserRouter>
        );

        await user.click(screen.getByRole("button", { name: "login.recoverPassword.backToLogin" }));
        expect(setViewMock).toHaveBeenCalledWith("login");
    });

    it("includes hidden intent field for forgot_password", () => {
        renderForm();
        const hiddenInput = document.querySelector('input[name="intent"][value="forgot_password"]') as HTMLInputElement;
        expect(hiddenInput).toBeTruthy();
    });
});
