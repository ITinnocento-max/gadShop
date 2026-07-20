import { t } from "@/lib/translations";

describe("t()", () => {
  it("returns translated string for a valid key in English", () => {
    expect(t("en", "common.app_name")).toBe("Blandon 250");
    expect(t("en", "nav.home")).toBe("Home");
    expect(t("en", "common.search_placeholder")).toBe("Search smartphones, accessories...");
  });

  it("returns translated string for a valid key in French", () => {
    expect(t("fr", "common.app_name")).toBe("Blandon 250");
    expect(t("fr", "nav.home")).toBe("Accueil");
    expect(t("fr", "common.search_placeholder")).toBe("Rechercher smartphones, accessoires...");
  });

  it("returns translated string for Swahili", () => {
    expect(t("sw", "common.app_name")).toBe("Blandon 250");
    expect(t("sw", "nav.cart")).toBe("Kart");
  });

  it("returns translated string for Kinyarwanda", () => {
    expect(t("rw", "common.app_name")).toBe("Blandon 250");
    expect(t("rw", "nav.home")).toBe("Ahabanza");
  });

  it("returns the key itself for an unknown locale", () => {
    expect(t("de", "common.app_name")).toBe("common.app_name");
  });

  it("returns the key itself for a non-existent key", () => {
    expect(t("en", "nonexistent.key")).toBe("nonexistent.key");
  });

  it("returns the key itself for a partially matching path", () => {
    expect(t("en", "common")).toBe("common");
  });
});
