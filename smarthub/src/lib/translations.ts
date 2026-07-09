import en from "@/i18n/messages/en.json";
import fr from "@/i18n/messages/fr.json";
import sw from "@/i18n/messages/sw.json";
import rw from "@/i18n/messages/rw.json";

type Messages = Record<string, Record<string, string>>;

const messages: Record<string, Messages> = { en, fr, sw, rw };

function getNestedValue(obj: Messages, path: string): string {
  const keys = path.split(".");
  let value: unknown = obj;
  for (const key of keys) {
    if (value && typeof value === "object" && key in (value as Record<string, unknown>)) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof value === "string" ? value : path;
}

export function t(locale: string, key: string): string {
  const msg = messages[locale];
  if (!msg) return key;
  return getNestedValue(msg, key);
}
