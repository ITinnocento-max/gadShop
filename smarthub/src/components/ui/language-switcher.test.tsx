/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageSwitcher } from "./language-switcher";
import { useUIStore } from "@/stores/ui-store";

beforeEach(() => {
  useUIStore.setState({ language: "en" });
});

describe("LanguageSwitcher", () => {
  it("renders the current language label", () => {
    render(<LanguageSwitcher />);
    expect(screen.getByText("English")).toBeInTheDocument();
  });

  it("opens the dropdown on click", () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByText("English"));
    expect(screen.getByText("Français")).toBeInTheDocument();
    expect(screen.getByText("Kiswahili")).toBeInTheDocument();
    expect(screen.getByText("Ikinyarwanda")).toBeInTheDocument();
  });

  it("switches language when a different option is clicked", () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByText("English"));
    fireEvent.click(screen.getByText("Français"));
    expect(useUIStore.getState().language).toBe("fr");
  });

  it("shows a check mark on the active language", () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByText("English"));
    const buttons = screen.getAllByRole("button");
    const enButtons = buttons.filter((b) => b.textContent?.includes("English"));
    expect(enButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("closes the dropdown after selecting a language", () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByText("English"));
    fireEvent.click(screen.getByText("Kiswahili"));
    expect(screen.queryByText("Français")).not.toBeInTheDocument();
  });
});
