import { useUIStore } from "@/stores/ui-store";
import { t } from "@/lib/translations";

export function useTranslation() {
  const language = useUIStore((s) => s.language);

  return {
    locale: language,
    t: (key: string) => t(language, key),
  };
}
