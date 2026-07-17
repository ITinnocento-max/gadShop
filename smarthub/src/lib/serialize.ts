const DECIMAL_FIELDS = new Set([
  "price", "originalPrice", "costPrice", "total", "amount",
  "openingBalance", "currentBalance", "rate", "discountValue",
]);

function isDecimal(value: unknown): value is { toNumber(): number } {
  return (
    value !== null &&
    typeof value === "object" &&
    "toNumber" in value &&
    typeof (value as Record<string, unknown>).toNumber === "function" &&
    "s" in value &&
    "e" in value &&
    "d" in value
  );
}

function hasBuiltinSerializer(value: object): boolean {
  return typeof (value as Record<string, unknown>).toJSON === "function";
}

export function serializeResponse<T>(data: T): T {
  if (data === null || data === undefined) return data;
  if (Array.isArray(data)) {
    return data.map(serializeResponse) as T;
  }
  if (typeof data === "object") {
    if (hasBuiltinSerializer(data)) {
      return data;
    }
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (DECIMAL_FIELDS.has(key) && isDecimal(value)) {
        result[key] = value.toNumber();
      } else if (typeof value === "object" && value !== null) {
        result[key] = serializeResponse(value);
      } else {
        result[key] = value;
      }
    }
    return result as T;
  }
  return data;
}
