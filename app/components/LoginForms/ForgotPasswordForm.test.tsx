import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

describe("ForgotPasswordForm", () => {
    const defaultProps = {
        setView: vi.fn(),
        t: vi.fn((key: string) => key),
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
                <ForgotPasswordForm t={defaultProps.t} setView={setViewMock} />
            </BrowserRouter>
        );

        await user.click(screen.getByRole("button", { name: "login.recoverPassword.backToLogin" }));
        expect(setViewMock).toHaveBeenCalledWith("login");
    });
});
