import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router";
import { Sidebar } from "./index";

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
        i18n: { language: "en" },
    }),
}));

describe("Sidebar", () => {
    const mockProjects = [
        {
            id: 1,
            name: "Project One",
            subprojects: [{ id: "sub-1", model: "roberta" }],
            behaviors: ["spam", "toxicity"] as any,
            models: ["roberta"] as any,
            createdAt: "2024-01-01T00:00:00Z"
        },
    ];

    const mockUser = {
        name: "John",
        lastName: "Doe",
        nickname: "jdoe123",
    };

    const renderSidebar = (props = {}) => {
        return render(
            <BrowserRouter>
                <Sidebar projects={mockProjects as any} user={mockUser as any} {...props} />
            </BrowserRouter>
        );
    };

    it("renders the home navigation link", () => {
        renderSidebar();
        expect(screen.getByText("sidebar.home")).toBeInTheDocument();
    });

    it("renders global quick actions titles", () => {
        renderSidebar();
        expect(screen.getByText("sidebar.quickActions")).toBeInTheDocument();
        expect(screen.getByText("sidebar.newEntry")).toBeInTheDocument();
        expect(screen.getByText("sidebar.newProject")).toBeInTheDocument();
    });

    it("renders project titles", () => {
        renderSidebar();
        expect(screen.getByText("sidebar.yourProjects")).toBeInTheDocument();
        expect(screen.getByText("Project One")).toBeInTheDocument();
    });

    it("renders user information correctly", () => {
        renderSidebar();
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("jdoe123")).toBeInTheDocument();
    });

    it("shows fallback user when no user prop provided", () => {
        render(
            <BrowserRouter>
                <Sidebar projects={mockProjects as any} user={undefined} />
            </BrowserRouter>
        );
        expect(screen.getByText("Research User")).toBeInTheDocument();
        expect(screen.getByText("@research")).toBeInTheDocument();
    });

    it("toggles the collapsed state", async () => {
        const user = userEvent.setup();
        const { container } = renderSidebar();

        // Since sidebar width is dynamic based on class, we assert on presence of text elements
        expect(screen.getByText("sidebar.yourProjects")).toBeInTheDocument();

        const toggleBtn = screen.getByTitle("Collapse sidebar");
        await user.click(toggleBtn);

        // Some texts should be hidden now
        expect(screen.queryByText("sidebar.yourProjects")).not.toBeInTheDocument();
        expect(screen.queryByText("Project One")).not.toBeInTheDocument();

        // Check if the toggle button changes title
        expect(screen.getByTitle("Expand sidebar")).toBeInTheDocument();
    });

    it("renders no active projects message when projects array is empty", () => {
        render(
            <BrowserRouter>
                <Sidebar projects={[]} user={mockUser as any} />
            </BrowserRouter>
        );
        expect(screen.getByText("sidebar.noActiveProjects")).toBeInTheDocument();
    });

    it("closes the logout confirmation modal when cancelled", async () => {
        const user = userEvent.setup();
        renderSidebar();

        // Open modal
        const logoutBtn = screen.getByTitle("sidebar.logout");
        await user.click(logoutBtn);
        expect(screen.getAllByText("sidebar.logoutConfirmTitle")[0]).toBeInTheDocument();

        // Cancel modal - The ConfirmationModal mock uses onClose when Cancel is clicked
        const cancelBtn = screen.getByText("sidebar.cancel");
        await user.click(cancelBtn);

        expect(screen.queryByText("sidebar.logoutConfirmDesc")).not.toBeInTheDocument();
    });
});
