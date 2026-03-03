import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router";
import { RegisterForm } from "./RegisterForm";

describe("RegisterForm", () => {
    const defaultProps = {
        setView: vi.fn(),
        t: vi.fn((key: string) => key),
        actionData: undefined,
        isSubmitting: false,
    };

    const renderForm = () => render(
        <BrowserRouter>
            <RegisterForm {...defaultProps} />
        </BrowserRouter>
    );

    it("renders register form correctly", () => {
        renderForm();
        expect(screen.getByText("login.register.title")).toBeInTheDocument();
        expect(screen.getByText("login.register.firstName")).toBeInTheDocument();
        expect(screen.getByText("login.register.lastName")).toBeInTheDocument();
        expect(screen.getByText("login.register.email")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "login.register.requestAccess" })).toBeInTheDocument();
    });

    it("generates a suggested username based on first and last name", async () => {
        const user = userEvent.setup();
        renderForm();

        const firstInput = screen.getByLabelText("login.register.firstName");
        const lastInput = screen.getByLabelText("login.register.lastName");
        const usernameInput = screen.getByPlaceholderText("jdoe");

        await user.type(firstInput, "John");
        await user.type(lastInput, "Doe Smith");

        expect(usernameInput).toHaveValue("jdoesmith");
    });

    it("allows overriding the suggested username", async () => {
        const user = userEvent.setup();
        renderForm();

        const editBtn = screen.getByTitle("Edit Username");
        await user.click(editBtn);

        const usernameInput = screen.getByPlaceholderText("jdoe");
        await user.clear(usernameInput);
        await user.type(usernameInput, "customuser123");

        expect(usernameInput).toHaveValue("customuser123");
    });

    it("calls setView('login') when login link is clicked", async () => {
        const user = userEvent.setup();
        const setViewMock = vi.fn();
        render(
            <BrowserRouter>
                <RegisterForm t={defaultProps.t} setView={setViewMock} actionData={undefined} isSubmitting={false} />
            </BrowserRouter>
        );

        await user.click(screen.getByText("login.register.loginHere"));
        expect(setViewMock).toHaveBeenCalledWith("login");
    });

    it("restores suggested username when Cancel Edition is clicked", async () => {
        const user = userEvent.setup();
        renderForm();

        const firstInput = screen.getByLabelText("login.register.firstName");
        const lastInput = screen.getByLabelText("login.register.lastName");
        await user.type(firstInput, "John");
        await user.type(lastInput, "Doe");

        const editBtn = screen.getByTitle("Edit Username");
        await user.click(editBtn);

        const usernameInput = screen.getByDisplayValue("jdoe");
        await user.type(usernameInput, "modified");
        expect(usernameInput).toHaveValue("jdoemodified");

        const cancelBtn = screen.getByTitle("Cancel Edition");
        await user.click(cancelBtn);

        expect(usernameInput).toHaveValue("jdoe");
    });

    it("calls setView('login') when form is submitted", async () => {
        const user = userEvent.setup();
        const setViewMock = vi.fn();
        render(
            <BrowserRouter>
                <RegisterForm t={defaultProps.t} setView={setViewMock} actionData={undefined} isSubmitting={false} />
            </BrowserRouter>
        );

        const firstInput = screen.getByLabelText("login.register.firstName");
        const lastInput = screen.getByLabelText("login.register.lastName");
        const emailInput = screen.getByLabelText("login.register.email");

        await user.type(firstInput, "John");
        await user.type(lastInput, "Doe");
        await user.type(emailInput, "john@example.com");

        const submitBtn = screen.getByRole("button", { name: "login.register.requestAccess" });
        await user.click(submitBtn);

        expect(setViewMock).toHaveBeenCalledWith("login");
    });
});
