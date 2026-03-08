import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TweetCard } from "./TweetCard";
import type { TwitterMetadata } from "~/services/api/entries/types";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string, fallback: string) => fallback || key,
        i18n: { language: "en-US" }
    }),
}));

describe("TweetCard", () => {
    const mockOnChange = vi.fn();

    const defaultMetadata: TwitterMetadata = {
        isReply: false,
        hasQuote: false,
        quotedText: "",
        isQuoteAReply: false,
        date: "2024-01-01T12:00",
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders correctly in readOnly mode", () => {
        render(
            <TweetCard
                mode="readOnly"
                initialData={{
                    text: "Hello World",
                    metadata: defaultMetadata,
                }}
            />
        );
        expect(screen.getByText("Hello World")).toBeInTheDocument();
        expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
        // Date formatting based on en-US medium
        expect(screen.getByText(/Jan 1, 2024/i)).toBeInTheDocument();
    });

    it("renders reply context when isReply is true", () => {
        render(
            <TweetCard
                mode="readOnly"
                initialData={{
                    text: "Reply tweet",
                    metadata: { ...defaultMetadata, isReply: true },
                }}
            />
        );
        expect(screen.getByText("Este tweet es una respuesta a otro tweet")).toBeInTheDocument();
    });

    it("renders quote context when hasQuote is true", () => {
        render(
            <TweetCard
                mode="readOnly"
                initialData={{
                    text: "Quote parent",
                    metadata: { ...defaultMetadata, hasQuote: true, quotedText: "Quoted message" },
                }}
            />
        );
        expect(screen.getByText("Quoted message")).toBeInTheDocument();
        expect(screen.getByText("Tweet citado")).toBeInTheDocument();
    });

    it("renders quote reply context when isQuoteAReply is true", () => {
        render(
            <TweetCard
                mode="readOnly"
                initialData={{
                    text: "Quote parent",
                    metadata: { ...defaultMetadata, hasQuote: true, isQuoteAReply: true, quotedText: "Quoted message" },
                }}
            />
        );
        expect(screen.getByText("Este tweet es una respuesta a otro tweet")).toBeInTheDocument();
    });

    it("handles text changes in interactive mode", async () => {
        const user = userEvent.setup();
        render(<TweetCard mode="interactive" onChange={mockOnChange} />);

        const textarea = screen.getByPlaceholderText("Ingresa el texto a analizar...");
        await user.type(textarea, "Typing text");

        expect(mockOnChange).toHaveBeenCalled();
        expect(mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0].text).toBe("Typing text");
    });

    it("handles metadata 'isReply' checkbox change", async () => {
        const user = userEvent.setup();
        render(<TweetCard mode="interactive" onChange={mockOnChange} />);

        const isReplyCheckbox = screen.getByLabelText("¿Es una respuesta?");
        await user.click(isReplyCheckbox);

        expect(mockOnChange).toHaveBeenCalled();
        expect(mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0].metadata.isReply).toBe(true);
    });

    it("handles metadata 'hasQuote' and 'isQuoteAReply' changes and quoted text", async () => {
        const user = userEvent.setup();
        render(<TweetCard mode="interactive" onChange={mockOnChange} />);

        // Check hasQuote
        const hasQuoteCheckbox = screen.getByLabelText("¿Tiene cita?");
        await user.click(hasQuoteCheckbox);

        let lastCallData = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
        expect(lastCallData.metadata.hasQuote).toBe(true);
        expect(screen.getByPlaceholderText("Ingrese el texto del tweet citado...")).toBeInTheDocument();

        // Check isQuoteAReply (which appears only after hasQuote is true)
        const isQuoteAReplyCheckbox = screen.getByLabelText("¿La cita es una respuesta?");
        await user.click(isQuoteAReplyCheckbox);

        lastCallData = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
        expect(lastCallData.metadata.isQuoteAReply).toBe(true);

        // Type in quoted text
        const quoteTextarea = screen.getByPlaceholderText("Ingrese el texto del tweet citado...");
        await user.type(quoteTextarea, "Quote");

        lastCallData = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
        expect(lastCallData.metadata.quotedText).toBe("Quote");
    });

    it("handles date change and clearing in interactive mode", async () => {
        const user = userEvent.setup();
        const { container } = render(
            <TweetCard
                mode="interactive"
                initialData={{ text: "", metadata: defaultMetadata }}
                onChange={mockOnChange}
            />
        );

        // Find date input
        const dateInput = container.querySelector('input[type="datetime-local"]') as HTMLInputElement;
        expect(dateInput).toBeInTheDocument();

        fireEvent.change(dateInput, { target: { value: "2024-02-02T10:00" } });
        let lastCallData = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
        expect(lastCallData.metadata.date).toBe("2024-02-02T10:00");

        // Click delete button
        const deleteDateBtn = screen.getByText("Delete");
        await user.click(deleteDateBtn);

        lastCallData = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
        expect(lastCallData.metadata.date).toBe("");
        expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    });

    it("syncs state when initialData changes", () => {
        const { rerender } = render(
            <TweetCard mode="interactive" initialData={{ text: "First", metadata: defaultMetadata }} />
        );
        expect(screen.getByDisplayValue("First")).toBeInTheDocument();

        rerender(
            <TweetCard mode="interactive" initialData={{ text: "Second", metadata: { ...defaultMetadata, isReply: true } }} />
        );
        expect(screen.getByDisplayValue("Second")).toBeInTheDocument();
        expect(screen.getByText("Este tweet es una respuesta a otro tweet")).toBeInTheDocument();
    });
});
