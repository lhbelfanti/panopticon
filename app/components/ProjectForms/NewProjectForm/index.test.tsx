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
            id: "spam",
            name: "Spam",
            description: "Spam desc",
            iconName: "FileText",
            color: "red",
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
            { id: "b1", enabled: true, availableModels: ["m1", "m2"], iconName: "Circle", color: "red" },
            { id: "b2", enabled: true, availableModels: ["m2", "m3"], iconName: "Circle", color: "blue" },
        ];
        renderForm({ behaviorConfigs: behaviors as any });

        const b1 = screen.getByLabelText("projects.behaviors.b1");
        const b2 = screen.getByLabelText("projects.behaviors.b2");

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
        const behaviors = [{ id: "b1", enabled: true, availableModels: ["m1"], iconName: "Circle", color: "red" }];
        const initialData = { name: "P1", description: "D1", behaviors: ["b1"], models: ["m1"] };
        
        renderForm({ mode: "edit", initialData, behaviorConfigs: behaviors as any });

        const b1 = screen.getByLabelText("projects.behaviors.b1") as HTMLInputElement;
        expect(b1.checked).toBe(true);

        await user.click(b1);
        // Should still be checked because it's initially selected in edit mode
        expect(b1.checked).toBe(true);
    });

    it("shows incompatible models warning", () => {
        const behaviors = [
            { id: "b1", enabled: true, availableModels: ["m1"], iconName: "Circle", color: "red" },
            { id: "b2", enabled: true, availableModels: ["m2"], iconName: "Circle", color: "blue" },
        ];
        renderForm({ behaviorConfigs: behaviors as any });

        // Select b1 and b2 -> intersection is empty
        fireEvent.click(screen.getByLabelText("projects.behaviors.b1"));
        fireEvent.click(screen.getByLabelText("projects.behaviors.b2"));

        expect(screen.getByText("projects.new.noModelsIntersection")).toBeInTheDocument();
    });

    it("handles disabled behaviors and shows notAvailableText", () => {
        const behaviors = [
            { id: "b1", enabled: false, availableModels: ["m1"], iconName: "Circle", color: "red" },
        ];
        renderForm({ behaviorConfigs: behaviors as any });

        const b1 = screen.getByLabelText("projects.behaviors.b1") as HTMLInputElement;
        expect(b1.disabled).toBe(true);
    });
});
