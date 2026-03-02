import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router";
import ConfirmationModal from "./index";

vi.mock("react-router", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as any),
        Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    };
});

describe("ConfirmationModal", () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        icon: <span data-testid="test-icon" />,
        title: "Confirm Action",
        description: "Are you sure you want to do this?",
        cancelText: "Cancel",
        confirmText: "Confirm",
        confirmAction: "/test-action",
    };

    const renderModal = (props = {}) => {
        return render(
            <BrowserRouter>
                <ConfirmationModal {...defaultProps} {...props} />
            </BrowserRouter>
        );
    };

    it("does not render when isOpen is false", () => {
        renderModal({ isOpen: false });
        expect(screen.queryByText("Confirm Action")).not.toBeInTheDocument();
    });

    it("renders correctly when isOpen is true", () => {
        renderModal();
        expect(screen.getByText("Confirm Action")).toBeInTheDocument();
        expect(screen.getByText("Are you sure you want to do this?")).toBeInTheDocument();
        expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    });

    it("calls onClose when cancel button is clicked", async () => {
        const user = userEvent.setup();
        const onCloseMock = vi.fn();
        renderModal({ onClose: onCloseMock });

        const cancelBtn = screen.getByRole("button", { name: "Cancel" });
        await user.click(cancelBtn);

        expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it("renders hidden inputs correctly", () => {
        const hiddenInputs = { testId: "123", mode: "delete" };
        const { container } = renderModal({ hiddenInputs });

        const testIdInput = container.querySelector('input[name="testId"]');
        const modeInput = container.querySelector('input[name="mode"]');

        expect(testIdInput).toHaveValue("123");
        expect(modeInput).toHaveValue("delete");
    });

    it("calls onClose when backdrop is clicked", async () => {
        const user = userEvent.setup();
        const onCloseMock = vi.fn();
        const { container } = renderModal({ onClose: onCloseMock });

        // The backdrop is the outer div with fixed inset-0
        const backdrop = container.firstChild as HTMLElement;
        await user.click(backdrop);

        expect(onCloseMock).toHaveBeenCalled();
    });
});
