import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AuthFormManager } from "./index";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock("~/components/LoginForms/LoginForm", () => ({
    LoginForm: () => <div data-testid="login-form">Login Form</div>
}));
vi.mock("~/components/LoginForms/ForgotPasswordForm", () => ({
    ForgotPasswordForm: () => <div data-testid="forgot-form">Forgot Form</div>
}));
vi.mock("~/components/LoginForms/RegisterForm", () => ({
    RegisterForm: () => <div data-testid="register-form">Register Form</div>
}));

describe("AuthFormManager", () => {
    const defaultProps = {
        view: "login" as any,
        setView: vi.fn(),
        actionData: null,
        isSubmitting: false,
        description: "Form Description",
    };

    it("renders correct form based on view", () => {
        const { rerender } = render(<AuthFormManager {...defaultProps} />);
        expect(screen.getByTestId("login-form")).toBeInTheDocument();

        rerender(<AuthFormManager {...defaultProps} view="forgot" />);
        expect(screen.getByTestId("forgot-form")).toBeInTheDocument();

        rerender(<AuthFormManager {...defaultProps} view="register" />);
        expect(screen.getByTestId("register-form")).toBeInTheDocument();
    });
});
