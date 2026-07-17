const SYNONYMS: Record<string, string[]> = {
  phone: ["smartphone", "mobile", "cell"],
  smartphone: ["phone", "mobile", "cell"],
  mobile: ["phone", "smartphone", "cell"],
  laptop: ["notebook", "computer", "pc"],
  notebook: ["laptop", "computer"],
  watch: ["smartwatch", "wearable"],
  smartwatch: ["watch", "wearable"],
  wearable: ["watch", "smartwatch", "band"],
  buds: ["earbuds", "earphones", "earbuds", "wireless earbuds"],
  earbuds: ["buds", "earphones", "tws"],
  earphones: ["buds", "earbuds", "headphones"],
  headphones: ["headset", "earphones", "over-ear"],
  headset: ["headphones", "earphones"],
  charger: ["charging", "power adapter", "brick", "adapter"],
  charging: ["charger", "power", "adapter"],
  powerbank: ["power bank", "portable charger", "battery pack"],
  "power bank": ["powerbank", "portable charger"],
  cable: ["wire", "cord", "usb cable", "charging cable"],
  case: ["cover", "protector", "housing"],
  speaker: ["speakers", "bluetooth speaker", "portable speaker"],
  tablet: ["ipad", "tab"],
  camera: ["cam", "gopro", "action cam"],
  screen: ["display", "monitor"],
  display: ["screen", "monitor"],
  audio: ["sound", "music"],
  sound: ["audio", "music"],
  fast: ["turbo", "quick", "rapid", "super", "pro"],
  pro: ["professional", "advanced", "premium"],
  mini: ["small", "compact", "lite", "light"],
  max: ["plus", "ultra", "big", "large"],
  ultra: ["max", "plus", "pro", "premium"],
  premium: ["pro", "ultra", "elite", "titanium"],
  wireless: ["bluetooth", "bt", "cordless", "wifi"],
  bluetooth: ["wireless", "bt", "cordless"],
  gaming: ["game", "gamer"],
  nova: ["novatech"],
  galaxy: ["samsung"],
  iphone: ["apple", "ios"],
  macbook: ["apple", "laptop"],
  airpods: ["apple", "earbuds", "buds"],
  sony: ["wh", "wf"],
  titan: ["titanium"],
  gan: ["gallium nitride", "charger"],
};

export function expandSearchTerms(raw: string): string[] {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return [];

  const words = trimmed.split(/\s+/).filter(Boolean);
  const expanded = new Set<string>();

  for (const word of words) {
    expanded.add(word);
    const syns = SYNONYMS[word];
    if (syns) syns.forEach((s) => expanded.add(s));
  }

  return [...expanded];
}

export function buildProductSearchWhere(raw: string): Record<string, unknown> | null {
  const terms = expandSearchTerms(raw);
  if (terms.length === 0) return null;

  const orClauses: Record<string, unknown>[] = [];
  for (const term of terms) {
    orClauses.push({ name: { contains: term } });
    orClauses.push({ brand: { contains: term } });
    orClauses.push({ description: { contains: term } });
    orClauses.push({ category: { name: { contains: term } } });
  }

  return { OR: orClauses };
}

export function matchesSearch(
  product: { name: string; brand: string; description?: string; category?: { name: string } },
  raw: string
): boolean {
  const terms = expandSearchTerms(raw);
  if (terms.length === 0) return true;

  const name = product.name.toLowerCase();
  const brand = product.brand.toLowerCase();
  const desc = (product.description || "").toLowerCase();
  const cat = (product.category?.name || "").toLowerCase();

  return terms.some(
    (t) => name.includes(t) || brand.includes(t) || desc.includes(t) || cat.includes(t)
  );
}
