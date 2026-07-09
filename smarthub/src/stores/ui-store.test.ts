import { useUIStore } from "./ui-store";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  useUIStore.setState({
    theme: "light",
    language: "en",
    isCartOpen: false,
    isMobileMenuOpen: false,
  });
});

describe("useUIStore", () => {
  it("starts with default values", () => {
    expect(useUIStore.getState().theme).toBe("light");
    expect(useUIStore.getState().language).toBe("en");
    expect(useUIStore.getState().isCartOpen).toBe(false);
    expect(useUIStore.getState().isMobileMenuOpen).toBe(false);
  });

  describe("setTheme", () => {
    it("sets theme to dark and adds class to html", () => {
      useUIStore.getState().setTheme("dark");
      expect(useUIStore.getState().theme).toBe("dark");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("sets theme to light and removes class from html", () => {
      document.documentElement.classList.add("dark");
      useUIStore.getState().setTheme("light");
      expect(useUIStore.getState().theme).toBe("light");
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("persists theme to localStorage", () => {
      useUIStore.getState().setTheme("dark");
      expect(localStorage.getItem("smarthub-theme")).toBe("dark");
    });
  });

  describe("toggleTheme", () => {
    it("toggles from light to dark", () => {
      useUIStore.getState().toggleTheme();
      expect(useUIStore.getState().theme).toBe("dark");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("toggles from dark to light", () => {
      useUIStore.getState().setTheme("dark");
      useUIStore.getState().toggleTheme();
      expect(useUIStore.getState().theme).toBe("light");
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("persists toggled theme to localStorage", () => {
      useUIStore.getState().toggleTheme();
      expect(localStorage.getItem("smarthub-theme")).toBe("dark");

      useUIStore.getState().toggleTheme();
      expect(localStorage.getItem("smarthub-theme")).toBe("light");
    });
  });

  describe("setLanguage", () => {
    it("sets the language and persists to localStorage", () => {
      useUIStore.getState().setLanguage("fr");
      expect(useUIStore.getState().language).toBe("fr");
      expect(localStorage.getItem("smarthub-language")).toBe("fr");
    });
  });

  describe("setCartOpen", () => {
    it("opens and closes the cart sidebar", () => {
      useUIStore.getState().setCartOpen(true);
      expect(useUIStore.getState().isCartOpen).toBe(true);
      useUIStore.getState().setCartOpen(false);
      expect(useUIStore.getState().isCartOpen).toBe(false);
    });
  });

  describe("setMobileMenuOpen", () => {
    it("opens and closes the mobile menu", () => {
      useUIStore.getState().setMobileMenuOpen(true);
      expect(useUIStore.getState().isMobileMenuOpen).toBe(true);
      useUIStore.getState().setMobileMenuOpen(false);
      expect(useUIStore.getState().isMobileMenuOpen).toBe(false);
    });
  });
});
