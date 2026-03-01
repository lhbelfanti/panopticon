import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { LanguageSwitcher } from "./index";

const changeLanguageMock = vi.fn();

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        i18n: {
            language: "en",
            changeLanguage: changeLanguageMock,
        },
        t: (key: string) => key,
    }),
}));

describe("LanguageSwitcher", () => {
    it("renders the language toggle button", () => {
        render(<LanguageSwitcher />);
        expect(screen.getByRole("button", { name: /cambiar idioma/i })).toBeInTheDocument();
    });

    it("opens the dropdown when clicked", async () => {
        const user = userEvent.setup();
        render(<LanguageSwitcher />);

        // Dropdown options should not exist initially
        expect(screen.queryByRole("button", { name: "English" })).not.toBeInTheDocument();

        const toggleBtn = screen.getByRole("button", { name: /cambiar idioma/i });
        await user.click(toggleBtn);

        // Dropdown options should now be visible
        expect(screen.getByRole("button", { name: "English" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Español" })).toBeInTheDocument();
    });

    it("calls i18n changeLanguage when an option is selected", async () => {
        const user = userEvent.setup();
        render(<LanguageSwitcher />);

        const toggleBtn = screen.getByRole("button", { name: /cambiar idioma/i });
        await user.click(toggleBtn);

        const esOption = screen.getByRole("button", { name: "Español" });
        await user.click(esOption);

        expect(changeLanguageMock).toHaveBeenCalledWith("es");
    });
});
