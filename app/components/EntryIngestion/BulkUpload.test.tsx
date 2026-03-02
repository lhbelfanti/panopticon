import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BulkUpload } from "./BulkUpload";

// Mock i18next
vi.mock("react-i18next", () => ({
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

    it("parses CSV correctly and calls onUpload", async () => {
        render(<BulkUpload onUpload={onUploadMock} />);
        const input = screen.getByLabelText("csv-upload-input") as HTMLInputElement;

        const csvContent = "text,other\nhello,1\nworld,2";
        const file = new File([csvContent], "test.csv", { type: "text/csv" });
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            fireEvent.click(screen.getByRole("button", { name: "entries.new.confirmUpload" }));
        });

        await waitFor(() => {
            expect(onUploadMock).toHaveBeenCalledWith(["hello", "world"]);
        });
    });

    it("handles onDragOver", () => {
        render(<BulkUpload onUpload={onUploadMock} />);
        const dropzone = screen.getByText("entries.new.dropzoneTitle").parentElement?.parentElement;
        const event = new MouseEvent('dragover', { bubbles: true, cancelable: true });
        Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
        fireEvent(dropzone!, event);
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it("handles handleDrop with invalid file", async () => {
        render(<BulkUpload onUpload={onUploadMock} />);
        const dropzone = screen.getByText("entries.new.dropzoneTitle").parentElement?.parentElement;

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

    it("shows error when CSV has no valid entries", async () => {
        render(<BulkUpload onUpload={onUploadMock} />);
        const input = screen.getByLabelText("csv-upload-input") as HTMLInputElement;
        const file = new File(["text\n"], "empty.csv", { type: "text/csv" });
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            fireEvent.click(screen.getByRole("button", { name: "entries.new.confirmUpload" }));
        });

        await waitFor(() => {
            expect(screen.getByText("CSV is empty or has no valid entries")).toBeInTheDocument();
        });
    });
});
