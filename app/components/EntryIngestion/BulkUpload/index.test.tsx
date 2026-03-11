import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BulkUpload } from "./index";

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
        expect(screen.getByText("projects.entries.new.dropzoneTitle")).toBeInTheDocument();
        expect(screen.getByText("projects.entries.new.selectFile")).toBeInTheDocument();
    });

    it("shows file name when a valid CSV is selected", async () => {
        render(<BulkUpload onUpload={onUploadMock} />);
        const input = screen.getByLabelText("csv-upload-input") as HTMLInputElement;

        const file = new File(["text\nhello\nworld"], "test.csv", { type: "text/csv" });
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText("test.csv")).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "projects.entries.new.bulkUpload.uploadButton" })).toBeInTheDocument();
        });
    });

    it("handles file removal", async () => {
        render(<BulkUpload onUpload={onUploadMock} />);
        const input = screen.getByLabelText("csv-upload-input") as HTMLInputElement;
        const file = new File(["text\nhello"], "test.csv", { type: "text/csv" });
        fireEvent.change(input, { target: { files: [file] } });

        const removeBtn = await screen.findByTitle("projects.entries.new.removeFile");
        fireEvent.click(removeBtn);

        expect(screen.queryByText("test.csv")).not.toBeInTheDocument();
    });

    it("handles drag and drop events", async () => {
        render(<BulkUpload onUpload={onUploadMock} />);
        const dropzone = screen.getByText("projects.entries.new.dropzoneTitle").parentElement?.parentElement?.parentElement!;
        
        fireEvent.dragEnter(dropzone);
        expect(dropzone.className).toContain("scale-[1.02]");

        fireEvent.dragLeave(dropzone);
        expect(dropzone.className).not.toContain("scale-[1.02]");

        const file = new File(["text\nhello"], "dropped.csv", { type: "text/csv" });
        fireEvent.drop(dropzone, {
            dataTransfer: { files: [file] }
        });

        await waitFor(() => {
            expect(screen.getByText("dropped.csv")).toBeInTheDocument();
        });
    });

    it("displays error for invalid file type", async () => {
        render(<BulkUpload onUpload={onUploadMock} />);
        const input = screen.getByLabelText("csv-upload-input");
        const file = new File(["hello"], "test.txt", { type: "text/plain" });
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText("projects.entries.new.errorInvalidCsv", { exact: false })).toBeInTheDocument();
        });
    });

    it("generates template file", () => {
        const clickSpy = vi.fn();
        const setAttributeSpy = vi.fn();
        
        const originalCreateElement = document.createElement.bind(document);
        const originalAppendChild = document.body.appendChild.bind(document.body);
        const originalRemoveChild = document.body.removeChild.bind(document.body);

        const mockLink = {
            setAttribute: setAttributeSpy,
            click: clickSpy,
            style: {}
        };

        vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
            if (tagName === 'a') return mockLink as any;
            return originalCreateElement(tagName);
        });

        vi.spyOn(document.body, 'appendChild').mockImplementation((node: any) => {
            if (node === mockLink) return node;
            return originalAppendChild(node);
        });

        vi.spyOn(document.body, 'removeChild').mockImplementation((node: any) => {
            if (node === mockLink) return node;
            return originalRemoveChild(node);
        });
        
        render(<BulkUpload onUpload={onUploadMock} />);
        fireEvent.click(screen.getByText("projects.entries.new.bulkUpload.downloadTemplate"));

        expect(setAttributeSpy).toHaveBeenCalledWith("download", expect.stringContaining(".csv"));
        expect(clickSpy).toHaveBeenCalled();
        
        vi.restoreAllMocks();
    });

    it("parses Twitter CSV with metadata correctly", async () => {
        render(<BulkUpload onUpload={onUploadMock} socialMediaType="twitter" />);
        const input = screen.getByLabelText("csv-upload-input");

        const csvContent = 
            "text,date,is_reply,has_quote,quoted_text,is_quote_a_reply\n" +
            '"Tweet 1","2024-01-01",true,true,"Quoted",false';
        
        const file = new File([csvContent], "twitter.csv", { type: "text/csv" });
        fireEvent.change(input, { target: { files: [file] } });

        const confirmBtn = await screen.findByText("projects.entries.new.bulkUpload.uploadButton");
        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(onUploadMock).toHaveBeenCalledWith([
                {
                    text: "Tweet 1",
                    metadata: {
                        date: "2024-01-01",
                        isReply: true,
                        hasQuote: true,
                        quotedText: "Quoted",
                        isQuoteAReply: false
                    }
                }
            ]);
        });
    });

    it("handles empty CSV error", async () => {
        render(<BulkUpload onUpload={onUploadMock} />);
        const input = screen.getByLabelText("csv-upload-input");
        const file = new File([""], "empty.csv", { type: "text/csv" });
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText("File is empty or missing data rows")).toBeInTheDocument();
        });
    });

    it("handles missing text column error", async () => {
        render(<BulkUpload onUpload={onUploadMock} />);
        const input = screen.getByLabelText("csv-upload-input");
        const file = new File(["invalid,header\nval1,val2"], "invalid.csv", { type: "text/csv" });
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText("No 'text' column found in CSV")).toBeInTheDocument();
        });
    });
});
