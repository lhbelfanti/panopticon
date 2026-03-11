import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SettingsDangerZone } from "./index";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("SettingsDangerZone", () => {
    it("renders correctly and handles delete click", () => {
        const onDelete = vi.fn();
        render(<SettingsDangerZone onDelete={onDelete} />);

        expect(screen.getByText("projects.settings.dangerZoneTitle")).toBeInTheDocument();
        expect(screen.getByText("projects.settings.deleteButton")).toBeInTheDocument();

        fireEvent.click(screen.getByText("projects.settings.deleteButton"));
        expect(onDelete).toHaveBeenCalled();
    });
});
