import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router";
import { RegisterForm } from "./RegisterForm";

describe("RegisterForm", () => {
    const defaultProps = {
        setView: vi.fn(),
        t: vi.fn((key: string) => key),
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
                <RegisterForm t={defaultProps.t} setView={setViewMock} />
            </BrowserRouter>
        );

        await user.click(screen.getByText("login.register.loginHere"));
        expect(setViewMock).toHaveBeenCalledWith("login");
    });
});
