import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TweetCard } from "./index";
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
        // Check date formatting in readOnly
        expect(screen.getByText(/Jan 1, 2024/i)).toBeInTheDocument();
    });

    it("handles text change in interactive mode", async () => {
        const user = userEvent.setup();
        render(<TweetCard mode="interactive" onChange={mockOnChange} />);
        
        const textarea = screen.getByPlaceholderText(/Ingresa el texto a analizar/i);
        await user.type(textarea, "New Tweet Content");
        
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
            text: "New Tweet Content"
        }));
    });

    it("handles isReply toggle and metadata change", async () => {
        const user = userEvent.setup();
        render(<TweetCard mode="interactive" onChange={mockOnChange} />);
        
        const replyCheckbox = screen.getByLabelText(/¿Es una respuesta?/i);
        await user.click(replyCheckbox);
        
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
            metadata: expect.objectContaining({ isReply: true })
        }));
        
        // Header should appear
        expect(screen.getByText("Este tweet es una respuesta to otro tweet")).toBeInTheDocument();
    });

    it("handles hasQuote toggle and quoted text change", async () => {
        const user = userEvent.setup();
        render(<TweetCard mode="interactive" onChange={mockOnChange} />);
        
        const quoteCheckbox = screen.getByLabelText(/¿Tiene cita?/i);
        await user.click(quoteCheckbox);
        
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
            metadata: expect.objectContaining({ hasQuote: true })
        }));
        
        const quoteTextarea = screen.getByPlaceholderText(/Ingrese el texto del tweet citado/i);
        await user.type(quoteTextarea, "Quoted content");
        
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
            metadata: expect.objectContaining({ quotedText: "Quoted content" })
        }));
    });

    it("handles isQuoteAReply toggle", async () => {
        const user = userEvent.setup();
        render(<TweetCard mode="interactive" initialData={{ text: "", metadata: { ...defaultMetadata, hasQuote: true } }} onChange={mockOnChange} />);
        
        const quoteReplyCheckbox = screen.getByLabelText(/¿La cita es una respuesta?/i);
        await user.click(quoteReplyCheckbox);
        
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
            metadata: expect.objectContaining({ isQuoteAReply: true })
        }));
        
        expect(screen.getByText("Este tweet es una respuesta a otro tweet")).toBeInTheDocument();
    });

    it("handles date change and deletion", async () => {
        const user = userEvent.setup();
        render(<TweetCard mode="interactive" initialData={{ text: "", metadata: defaultMetadata }} onChange={mockOnChange} />);
        
        const dateInput = screen.getByDisplayValue(/2024-01-01/i); // based on initialData if provided, or default
        // Let's just use the input directly
        fireEvent.change(dateInput, { target: { value: "2024-02-02T10:00" } });
        
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
            metadata: expect.objectContaining({ date: "2024-02-02T10:00" })
        }));

        const deleteBtn = screen.getByText("Delete");
        await user.click(deleteBtn);
        
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
            metadata: expect.objectContaining({ date: "" })
        }));
    });

    it("syncs state when initialData prop changes", () => {
        const { rerender } = render(<TweetCard mode="readOnly" initialData={{ text: "First", metadata: defaultMetadata }} />);
        expect(screen.getByText("First")).toBeInTheDocument();
        
        rerender(<TweetCard mode="readOnly" initialData={{ text: "Second", metadata: defaultMetadata }} />);
        expect(screen.getByText("Second")).toBeInTheDocument();
    });
});
