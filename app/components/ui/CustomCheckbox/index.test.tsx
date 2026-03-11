import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CustomCheckbox } from "./index";

describe("CustomCheckbox", () => {
    it("renders label and handles change", () => {
        const onChange = vi.fn();
        render(<CustomCheckbox label="Test Checkbox" onChange={onChange} />);
        
        const checkbox = screen.getByLabelText("Test Checkbox");
        expect(checkbox).toBeInTheDocument();
        
        fireEvent.click(checkbox);
        expect(onChange).toHaveBeenCalled();
    });

    it("renders icon when provided", () => {
        render(<CustomCheckbox label="Icon Checkbox" icon={<span data-testid="test-icon">Icon</span>} />);
        expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    });

    it("renders notAvailableText when disabled", () => {
        render(<CustomCheckbox label="Disabled Checkbox" disabled notAvailableText="N/A" />);
        expect(screen.getByText("N/A")).toBeInTheDocument();
        expect(screen.getByLabelText(/Disabled Checkbox/i)).toBeDisabled();
    });
});
