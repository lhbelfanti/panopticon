import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NewAnalysisForm } from "./NewAnalysisForm";

vi.mock("react-i18next", () => ({
    Trans: ({ i18nKey, children }: any) => children || i18nKey,
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("NewAnalysisForm", () => {
    const onSubmitMock = vi.fn();

    const defaultProps = {
        subprojectId: "roberta",
        excludedEntryIds: [],
        isSubmitting: false,
        onSubmit: onSubmitMock,
        onOpenExclusions: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderForm = (props = {}) =>
        render(<NewAnalysisForm {...defaultProps} {...props} />);

    it("renders the form title", () => {
        renderForm();
        expect(screen.getByText("projects.analysis.newForm.title")).toBeInTheDocument();
    });

    it("shows 'Complete' and info text when no entries are excluded in Dataset selection", () => {
        renderForm({ excludedEntryIds: [] });
        expect(screen.getByText("projects.analysis.newForm.complete")).toBeInTheDocument();
        expect(screen.getByText("projects.analysis.newForm.completeDesc")).toBeInTheDocument();
    });

    it("shows 'Filtered' text when entries are excluded in Dataset selection", () => {
        renderForm({ excludedEntryIds: ["e1", "e2", "e3"] });
        expect(screen.getByText("projects.analysis.newForm.filtered")).toBeInTheDocument();
        expect(screen.getByText("projects.analysis.newForm.filteredDesc")).toBeInTheDocument();
    });

    it("shows 'Manage' for exclusions when no exclusions", () => {
        renderForm({ excludedEntryIds: [] });
        expect(screen.getByText("projects.analysis.newForm.manage")).toBeInTheDocument();
        expect(screen.getByText("projects.analysis.newForm.noExclusions")).toBeInTheDocument();
    });

    it("shows 'Refine list' for exclusions when entries are excluded", () => {
        renderForm({ excludedEntryIds: ["e1"] });
        expect(screen.getByText("projects.analysis.newForm.refineList")).toBeInTheDocument();
        expect(screen.getByText("projects.analysis.newForm.entriesExcluded")).toBeInTheDocument();
    });

    it("calls onOpenExclusions when the Exclusions card is clicked", async () => {
        const onOpenExclusions = vi.fn();
        const user = userEvent.setup();
        renderForm({ onOpenExclusions });

        const exclusionsCard = screen.getByRole("button", { name: /projects\.analysis\.newForm\.manage/i });
        await user.click(exclusionsCard);

        expect(onOpenExclusions).toHaveBeenCalled();
    });

    it("renders 'Generate Analysis' button when not submitting", () => {
        renderForm();
        expect(screen.getByRole("button", { name: /projects\.analysis\.newForm\.generate/i })).toBeInTheDocument();
    });

    it("button is enabled when not submitting", () => {
        renderForm({ isSubmitting: false });
        const btn = screen.getByRole("button", { name: /projects\.analysis\.newForm\.generate/i });
        expect(btn).not.toBeDisabled();
    });

    it("button is disabled when isSubmitting is true", () => {
        renderForm({ isSubmitting: true });
        const btn = screen.getByRole("button", { name: /projects\.analysis\.newForm\.starting/i });
        expect(btn).toBeDisabled();
    });

    it("shows 'Starting Analysis...' text when isSubmitting is true", () => {
        renderForm({ isSubmitting: true });
        expect(screen.getByText("projects.analysis.newForm.starting")).toBeInTheDocument();
    });

    it("calls onSubmit with excludedEntryIds when button is clicked", async () => {
        const user = userEvent.setup();
        const excludedEntryIds = ["e1", "e2"];
        renderForm({ excludedEntryIds });

        const btn = screen.getByRole("button", { name: /projects\.analysis\.newForm\.generate/i });
        await user.click(btn);

        expect(onSubmitMock).toHaveBeenCalledWith(excludedEntryIds);
    });

    it("calls onSubmit with empty array when no exclusions", async () => {
        const user = userEvent.setup();
        renderForm({ excludedEntryIds: [] });

        await user.click(screen.getByRole("button", { name: /projects\.analysis\.newForm\.generate/i }));

        expect(onSubmitMock).toHaveBeenCalledWith([]);
    });


    it("renders hint cards for guidance", () => {
        renderForm();
        expect(screen.getByText("projects.analysis.newForm.guideExcludeTitle")).toBeInTheDocument();
        expect(screen.getByText("projects.analysis.newForm.guideHistoryTitle")).toBeInTheDocument();
    });
});
