import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EntryForm } from "./EntryForm";
import { createMemoryRouter, RouterProvider } from "react-router";

// Mock i18next
vi.mock("react-i18next", () => ({
    Trans: ({ i18nKey, children }: any) => children || i18nKey,
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("EntryForm", () => {
    const onSubmitMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderWithRouter = (ui: React.ReactElement) => {
        const router = createMemoryRouter([
            { path: "/", element: ui }
        ], {
            initialEntries: ["/"],
        });
        return render(<RouterProvider router={router} />);
    };

    it("renders the form correctly", () => {
        renderWithRouter(<EntryForm onSubmit={onSubmitMock} />);
        expect(screen.getByText("projects.entries.new.interactiveForm.title")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("projects.entries.new.interactiveForm.placeholder")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "entries.new.submit" })).toBeInTheDocument();
    });

    it("calls onSubmit when form is submitted with text", () => {
        renderWithRouter(<EntryForm onSubmit={onSubmitMock} />);
        const textarea = screen.getByPlaceholderText("projects.entries.new.interactiveForm.placeholder");
        const submitBtn = screen.getByRole("button", { name: "entries.new.submit" });

        fireEvent.change(textarea, { target: { value: "Hello world" } });
        fireEvent.click(submitBtn);

        expect(onSubmitMock).toHaveBeenCalledWith("Hello world", expect.objectContaining({
            isReply: false,
            hasQuote: false,
        }), false);
    });

    it("disables submit button when text is empty", () => {
        renderWithRouter(<EntryForm onSubmit={onSubmitMock} />);
        const submitBtn = screen.getByRole("button", { name: "entries.new.submit" });
        expect(submitBtn).toBeDisabled();
    });

    it("shows submitting state", () => {
        renderWithRouter(<EntryForm onSubmit={onSubmitMock} isSubmitting={true} />);
        expect(screen.getByText("common.submitting")).toBeInTheDocument();
    });

    it("toggles uploadAnother when checkbox is clicked", () => {
        renderWithRouter(<EntryForm onSubmit={onSubmitMock} />);
        const checkbox = screen.getByLabelText("projects.entries.new.interactiveForm.uploadAnother");
        fireEvent.click(checkbox);

        const textarea = screen.getByPlaceholderText("projects.entries.new.interactiveForm.placeholder");
        const submitBtn = screen.getByRole("button", { name: "entries.new.submit" });

        fireEvent.change(textarea, { target: { value: "Hello world" } });
        fireEvent.click(submitBtn);

        expect(onSubmitMock).toHaveBeenCalledWith("Hello world", expect.anything(), true);
    });
});
