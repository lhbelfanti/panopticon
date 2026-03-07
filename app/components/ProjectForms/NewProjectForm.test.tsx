import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router";
import { NewProjectForm } from "./NewProjectForm";

vi.mock("react-router", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as any),
        Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    };
});

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
    Trans: ({ i18nKey }: any) => <span>{i18nKey}</span>,
}));

describe("NewProjectForm", () => {
    const mockBehaviors = [
        {
            id: "spam",
            name: "Spam",
            description: "Spam desc",
            iconName: "FileText",
            bgClass: "bg-red-500",
            colorClass: "text-red-500",
            enabled: true,
            availableModels: ["bert_spanish", "roberta_english"],
        },
        {
            id: "toxicity",
            name: "Toxicity",
            description: "Tox desc",
            iconName: "Shield",
            bgClass: "bg-blue-500",
            colorClass: "text-blue-500",
            enabled: true,
            availableModels: ["roberta_english", "llama3_zero_shot"],
        },
        {
            id: "disabled_beh",
            name: "Disabled Beh",
            description: "Desc",
            iconName: "Circle",
            bgClass: "bg-gray-500",
            colorClass: "text-gray-500",
            enabled: false,
            availableModels: ["bert_spanish"],
        },
    ];

    const defaultProps = {
        actionData: undefined,
        isSubmitting: false,
        behaviorConfigs: mockBehaviors as any,
    };

    const renderForm = (props = {}) => {
        return render(
            <BrowserRouter>
                <NewProjectForm {...defaultProps} {...props} />
            </BrowserRouter>
        );
    };

    it("renders form fields correctly", () => {
        renderForm();
        expect(screen.getByText("projects.new.name")).toBeInTheDocument();
        expect(screen.getByText("projects.new.description")).toBeInTheDocument();
        expect(screen.getByText("projects.new.behaviorsTitle")).toBeInTheDocument();
        expect(screen.getByText("projects.new.modelsTitle")).toBeInTheDocument();
    });

    it("renders enabled and disabled behaviors", () => {
        renderForm();
        expect(screen.getByText("projects.behaviors.spam")).toBeInTheDocument();
        expect(screen.getByText("projects.behaviors.disabled_beh")).toBeInTheDocument();

        const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
        const disabledCheckbox = checkboxes.find(c => c.value === "disabled_beh");
        expect(disabledCheckbox).toBeDisabled();
    });

    it("shows 'select behavior first' when no behavior is selected", () => {
        renderForm();
        expect(screen.getByText("projects.new.selectBehaviorFirst")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "projects.new.submit" })).toBeDisabled();
    });

    it("computes available models intersection and enables submit", async () => {
        const user = userEvent.setup();
        renderForm();

        const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
        const spamCheckbox = checkboxes.find(c => c.value === "spam");
        const toxCheckbox = checkboxes.find(c => c.value === "toxicity");

        // Select Spam
        if (spamCheckbox) await user.click(spamCheckbox);

        // Initial models for spam: bert_spanish, roberta_english
        expect(screen.getByText("projects.models.bert_spanish")).toBeInTheDocument();
        expect(screen.getByText("projects.models.roberta_english")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "projects.new.submit" })).not.toBeDisabled();

        // Select Toxicity as well (intersection leaves only roberta_english)
        if (toxCheckbox) await user.click(toxCheckbox);

        expect(screen.queryByText("projects.models.bert_spanish")).not.toBeInTheDocument();
        expect(screen.getByText("projects.models.roberta_english")).toBeInTheDocument();

        // Uncheck toxicity
        if (toxCheckbox) await user.click(toxCheckbox);
        expect(screen.getByText("projects.models.bert_spanish")).toBeInTheDocument();
    });

    it("displays actionData error if present", () => {
        renderForm({ actionData: { error: "Something went wrong" } });
        expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("shows no models intersection message", async () => {
        const user = userEvent.setup();

        // We create an artificial scenario where nothing intersects
        const noIntersectBehaviors = [
            ...mockBehaviors,
            {
                id: "exclusive_beh",
                name: "Exclusive",
                description: "Desc",
                iconName: "Circle",
                bgClass: "bg-gray-500",
                colorClass: "text-gray-500",
                enabled: true,
                availableModels: ["svm_baseline"],
            }
        ];

        renderForm({ behaviorConfigs: noIntersectBehaviors });

        const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
        const spamCheckbox = checkboxes.find(c => c.value === "spam");
        const exclusiveCheckbox = checkboxes.find(c => c.value === "exclusive_beh");

        if (spamCheckbox) await user.click(spamCheckbox);
        if (exclusiveCheckbox) await user.click(exclusiveCheckbox);

        expect(screen.getByText("projects.new.noModelsIntersection")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "projects.new.submit" })).toBeDisabled();
    });

    it("shows loading state when submitting", () => {
        // Need to pre-select a behavior so the intersection logic allows it to be non-disabled by the model check
        // Actually the button is fully disabled if isSubmitting anyway.
        renderForm({ isSubmitting: true });
        expect(screen.getByRole("button", { name: "projects.new.creating" })).toBeDisabled();
    });

    it("renders edit mode correctly and handles selection locking", async () => {
        renderForm({
            mode: "edit",
            initialData: {
                name: "Initial Project",
                description: "Initial Description",
                behaviors: ["spam"],
                models: ["bert_spanish"]
            }
        });

        expect(screen.getByDisplayValue("Initial Project")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Initial Description")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "projects.edit.submit" })).toBeInTheDocument();

        const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
        const spamCheckbox = checkboxes.find(c => c.value === "spam");
        const toxicityCheckbox = checkboxes.find(c => c.value === "toxicity");

        // Initial behavior should be checked and disabled (locked)
        expect(spamCheckbox).toBeChecked();
        expect(spamCheckbox).toBeDisabled();

        // Toxicity behavior should be disabled because it's incompatible with bert_spanish
        expect(toxicityCheckbox).not.toBeChecked();
        expect(toxicityCheckbox).toBeDisabled();
        expect(screen.getByText("projects.new.incompatibleWithModels")).toBeInTheDocument();

        // Initially selected model should be checked and disabled
        const bertCheckbox = checkboxes.find(c => c.value === "bert_spanish");
        expect(bertCheckbox).toBeChecked();
        expect(bertCheckbox).toBeDisabled();
    });

    it("disables submit button in edit mode if no model intersection", async () => {
        const user = userEvent.setup();
        renderForm({
            mode: "edit",
            initialData: {
                behaviors: [],
                models: []
            },
            // Add two behaviors that don't share models
            behaviorConfigs: [
                {
                    id: "b1",
                    enabled: true,
                    availableModels: ["bert_spanish"],
                    iconName: "Circle"
                },
                {
                    id: "b2",
                    enabled: true,
                    availableModels: ["roberta_english"],
                    iconName: "Circle"
                }
            ]
        });

        const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
        const b1Checkbox = checkboxes.find(c => c.value === "b1");
        const b2Checkbox = checkboxes.find(c => c.value === "b2");

        if (b1Checkbox) await user.click(b1Checkbox);
        if (b2Checkbox) await user.click(b2Checkbox);

        // Submit button should be disabled because intersection is now empty
        expect(screen.getByRole("button", { name: "projects.edit.submit" })).toBeDisabled();
        expect(screen.getByText("projects.new.noModelsIntersection")).toBeInTheDocument();
    });

    it("disables behaviors in edit mode if they are incompatible with existing models", async () => {
        renderForm({
            mode: "edit",
            initialData: {
                behaviors: ["spam"],
                models: ["bert_spanish"]
            },
            // toxicity supports roberta_english and llama3, NOT bert_spanish
            // So toxicity should be incompatible with bert_spanish in mockBehaviors
        });

        const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
        const toxicityCheckbox = checkboxes.find(c => c.value === "toxicity");

        expect(toxicityCheckbox).toBeDisabled();
        // The text is rendered via notAvailableText prop
        expect(screen.getByText("projects.new.incompatibleWithModels")).toBeInTheDocument();
    });
});
