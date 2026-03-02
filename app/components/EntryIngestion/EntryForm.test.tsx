import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EntryForm } from "./EntryForm";

// Mock i18next
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("EntryForm", () => {
    const onSubmitMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the form correctly", () => {
        render(<EntryForm onSubmit={onSubmitMock} />);
        expect(screen.getByLabelText("entries.new.manualEntryLabel")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("entries.new.placeholder")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "entries.new.submit" })).toBeInTheDocument();
    });

    it("calls onSubmit when form is submitted with text", () => {
        render(<EntryForm onSubmit={onSubmitMock} />);
        const textarea = screen.getByLabelText("entries.new.manualEntryLabel");
        const submitBtn = screen.getByRole("button", { name: "entries.new.submit" });

        fireEvent.change(textarea, { target: { value: "Hello world" } });
        fireEvent.click(submitBtn);

        expect(onSubmitMock).toHaveBeenCalledWith("Hello world");
        expect(textarea).toHaveValue("");
    });

    it("disables submit button when text is empty", () => {
        render(<EntryForm onSubmit={onSubmitMock} />);
        const submitBtn = screen.getByRole("button", { name: "entries.new.submit" });
        expect(submitBtn).toBeDisabled();
    });

    it("shows submitting state", () => {
        render(<EntryForm onSubmit={onSubmitMock} isSubmitting={true} />);
        expect(screen.getByText("common.submitting")).toBeInTheDocument();
    });
});
