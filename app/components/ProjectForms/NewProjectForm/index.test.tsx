import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router";
import { NewProjectForm } from "./index";

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

// Mock components
vi.mock("~/components/AdverseBehaviorLabel", () => ({
    AdverseBehaviorLabel: () => <div data-testid="adverse-behavior-label" />
}));

vi.mock("~/components/ui/CustomCheckbox", () => ({
    CustomCheckbox: (props: any) => (
        <label>
            <input 
                type="checkbox" 
                name={props.name} 
                value={props.value} 
                checked={props.checked} 
                disabled={props.disabled}
                onChange={props.onChange}
            />
            {props.label}
        </label>
    )
}));

describe("NewProjectForm", () => {
    const mockBehaviors = [
        {
            id: "illicit_drugs",
            name: "Spam",
            description: "Spam desc",
            enabled: true,
            availableModels: ["bert_spanish", "roberta_english"],
        }
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
    });

    it("toggles behaviors and updates available models", async () => {
        const user = userEvent.setup();
        const behaviors = [
            { id: "illicit_drugs", enabled: true, availableModels: ["m1", "m2"] },
            { id: "hate_speech", enabled: true, availableModels: ["m2", "m3"] },
        ];
        renderForm({ behaviorConfigs: behaviors as any });

        const b1 = screen.getByLabelText("projects.behaviors.illicit_drugs");
        const b2 = screen.getByLabelText("projects.behaviors.hate_speech");

        await user.click(b1);
        expect(screen.getByLabelText("projects.models.m1")).toBeInTheDocument();
        expect(screen.getByLabelText("projects.models.m2")).toBeInTheDocument();

        await user.click(b2);
        // Intersection is only m2
        expect(screen.queryByLabelText("projects.models.m1")).not.toBeInTheDocument();
        expect(screen.getByLabelText("projects.models.m2")).toBeInTheDocument();
        expect(screen.queryByLabelText("projects.models.m3")).not.toBeInTheDocument();
    });

    it("handles edit mode and restricts unchecking initial behaviors", async () => {
        const user = userEvent.setup();
        const behaviors = [{ id: "illicit_drugs", enabled: true, availableModels: ["m1"] }];
        const initialData = { name: "P1", description: "D1", behaviors: ["illicit_drugs"], models: ["m1"] };
        
        renderForm({ mode: "edit", initialData, behaviorConfigs: behaviors as any });

        const b1 = screen.getByLabelText("projects.behaviors.illicit_drugs") as HTMLInputElement;
        expect(b1.checked).toBe(true);

        await user.click(b1);
        // Should still be checked because it's initially selected in edit mode
        expect(b1.checked).toBe(true);
    });

    it("shows incompatible models warning", () => {
        const behaviors = [
            { id: "illicit_drugs", enabled: true, availableModels: ["m1"] },
            { id: "hate_speech", enabled: true, availableModels: ["m2"] },
        ];
        renderForm({ behaviorConfigs: behaviors as any });

        // Select b1 and b2 -> intersection is empty
        fireEvent.click(screen.getByLabelText("projects.behaviors.illicit_drugs"));
        fireEvent.click(screen.getByLabelText("projects.behaviors.hate_speech"));

        expect(screen.getByText("projects.new.noModelsIntersection")).toBeInTheDocument();
    });

    it("handles disabled behaviors and shows notAvailableText", () => {
        const behaviors = [
            { id: "illicit_drugs", enabled: false, availableModels: ["m1"] },
        ];
        renderForm({ behaviorConfigs: behaviors as any });

        const b1 = screen.getByLabelText("projects.behaviors.illicit_drugs") as HTMLInputElement;
        expect(b1.disabled).toBe(true);
    });
});
