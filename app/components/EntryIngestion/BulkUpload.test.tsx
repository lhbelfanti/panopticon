import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BulkUpload } from "./BulkUpload";

// Mock i18next
vi.mock("react-i18next", () => ({
    Trans: ({ i18nKey, children }: any) => children || i18nKey,
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("BulkUpload", () => {
    const onUploadMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the dropzone correctly", () => {
        render(<BulkUpload onUpload={onUploadMock} />);
        expect(screen.getByText("entries.new.dropzoneTitle")).toBeInTheDocument();
        expect(screen.getByText("entries.new.selectFile")).toBeInTheDocument();
    });

    it("shows error for invalid file type", async () => {
        render(<BulkUpload onUpload={onUploadMock} />);
        const input = screen.getByLabelText("csv-upload-input") as HTMLInputElement;

        const file = new File(["foo"], "foo.txt", { type: "text/plain" });
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText("entries.new.errorInvalidCsv")).toBeInTheDocument();
        });
    });

    it("shows file name when a valid CSV is selected", async () => {
        render(<BulkUpload onUpload={onUploadMock} />);
        const input = screen.getByLabelText("csv-upload-input") as HTMLInputElement;

        const file = new File(["text\nhello\nworld"], "test.csv", { type: "text/csv" });
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText("test.csv")).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "entries.new.confirmUpload" })).toBeInTheDocument();
        });
    });

    it("parses CSV correctly and calls onUpload (Generic)", async () => {
        render(<BulkUpload onUpload={onUploadMock} socialMediaType="generic" />);
        const input = screen.getByLabelText("csv-upload-input") as HTMLInputElement;

        const csvContent = "text,other\nhello,1\nworld,2";
        const file = new File([csvContent], "test.csv", { type: "text/csv" });
        fireEvent.change(input, { target: { files: [file] } });

        const confirmBtn = await screen.findByRole("button", { name: "entries.new.confirmUpload" });
        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(onUploadMock).toHaveBeenCalledWith([
                { text: "hello", metadata: undefined },
                { text: "world", metadata: undefined }
            ]);
        });
    });

    it("parses CSV correctly and calls onUpload (Twitter)", async () => {
        render(<BulkUpload onUpload={onUploadMock} socialMediaType="twitter" />);
        const input = screen.getByLabelText("csv-upload-input") as HTMLInputElement;

        const csvContent = 'text,date,is_reply,has_quote,quoted_text,is_quote_a_reply\n"hello","Jan 01",true,false,,false';
        const file = new File([csvContent], "test.csv", { type: "text/csv" });
        fireEvent.change(input, { target: { files: [file] } });

        const confirmBtn = await screen.findByRole("button", { name: "entries.new.confirmUpload" });
        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(onUploadMock).toHaveBeenCalledWith([
                {
                    text: "hello",
                    metadata: {
                        date: "Jan 01",
                        isReply: true,
                        hasQuote: false,
                        quotedText: "",
                        isQuoteAReply: false
                    }
                }
            ]);
        });
    });

    it("handles handleDrop with invalid file", async () => {
        render(<BulkUpload onUpload={onUploadMock} />);
        const dropzone = screen.getByLabelText("csv-upload-input").parentElement;

        const file = new File(["foo"], "foo.txt", { type: "text/plain" });
        const dataTransfer = {
            files: [file],
            types: ["Files"],
        };

        fireEvent.drop(dropzone!, { dataTransfer });

        await waitFor(() => {
            expect(screen.getByText("entries.new.errorInvalidCsv")).toBeInTheDocument();
        });
    });

    it("handles handleDrop with valid file", async () => {
        render(<BulkUpload onUpload={onUploadMock} />);
        const dropzone = screen.getByLabelText("csv-upload-input").parentElement;

        const file = new File(["text\nhello\nworld"], "test.csv", { type: "text/csv" });
        const dataTransfer = {
            files: [file],
            types: ["Files"],
        };

        fireEvent.drop(dropzone!, { dataTransfer });

        await waitFor(() => {
            expect(screen.getByText("test.csv")).toBeInTheDocument();
        });
    });

    it("handles DragEnter and DragLeave", async () => {
        render(<BulkUpload onUpload={onUploadMock} />);
        const dropzone = screen.getByLabelText("csv-upload-input").parentElement;

        fireEvent.dragEnter(dropzone!);
        expect(dropzone).toHaveClass("bg-primary/10");

        fireEvent.dragLeave(dropzone!);
        expect(dropzone).not.toHaveClass("bg-primary/10");
    });

    it("clears file when X button is clicked", async () => {
        render(<BulkUpload onUpload={onUploadMock} />);
        const input = screen.getByLabelText("csv-upload-input") as HTMLInputElement;
        const file = new File(["text\nhello"], "test.csv", { type: "text/csv" });
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText("test.csv")).toBeInTheDocument();
        });

        const clearBtn = screen.getByTitle("Remove file");
        fireEvent.click(clearBtn);

        expect(screen.queryByText("test.csv")).not.toBeInTheDocument();
    });

    it("triggers generateTemplate generic", () => {
        render(<BulkUpload onUpload={onUploadMock} socialMediaType="generic" />);
        const downloadBtn = screen.getByText("Download Template");

        // Mock link click
        const appendChildSpy = vi.spyOn(document.body, "appendChild");
        const removeChildSpy = vi.spyOn(document.body, "removeChild");

        fireEvent.click(downloadBtn);

        expect(appendChildSpy).toHaveBeenCalled();
        expect(removeChildSpy).toHaveBeenCalled();

        appendChildSpy.mockRestore();
        removeChildSpy.mockRestore();
    });

    it("triggers generateTemplate twitter", () => {
        render(<BulkUpload onUpload={onUploadMock} socialMediaType="twitter" />);
        const downloadBtn = screen.getByText("Download Template");

        const appendChildSpy = vi.spyOn(document.body, "appendChild");
        const removeChildSpy = vi.spyOn(document.body, "removeChild");

        fireEvent.click(downloadBtn);

        expect(appendChildSpy).toHaveBeenCalled();
        expect(removeChildSpy).toHaveBeenCalled();

        appendChildSpy.mockRestore();
        removeChildSpy.mockRestore();
    });

    it("fails parsing if text column missing", async () => {
        render(<BulkUpload onUpload={onUploadMock} />);
        const input = screen.getByLabelText("csv-upload-input") as HTMLInputElement;

        const csvContent = "other\nhello\nworld";
        const file = new File([csvContent], "test.csv", { type: "text/csv" });
        fireEvent.change(input, { target: { files: [file] } });

        const confirmBtn = await screen.findByRole("button", { name: "entries.new.confirmUpload" });
        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(screen.getByText("No 'text' column found in CSV")).toBeInTheDocument();
        });
    });

    it("fails parsing if file is empty", async () => {
        render(<BulkUpload onUpload={onUploadMock} />);
        const input = screen.getByLabelText("csv-upload-input") as HTMLInputElement;

        const csvContent = "text";
        const file = new File([csvContent], "test.csv", { type: "text/csv" });
        fireEvent.change(input, { target: { files: [file] } });

        const confirmBtn = await screen.findByRole("button", { name: "entries.new.confirmUpload" });
        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(screen.getByText("File is empty or missing data rows")).toBeInTheDocument();
        });
    });
});
