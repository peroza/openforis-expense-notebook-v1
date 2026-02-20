/**
 * Parses a user-entered amount string into a number.
 * Accepts both US (1,234.56) and EU (1.234,56 or 25,25) formats:
 * - Whichever of comma or dot appears last is the decimal separator.
 * - The other is treated as thousands separator and removed.
 * - Spaces are always removed.
 */
export function parseAmountInput(value: string): number {
  const trimmed = value.trim().replace(/\s/g, "");
  const lastComma = trimmed.lastIndexOf(",");
  const lastDot = trimmed.lastIndexOf(".");

  let normalized: string;
  if (lastComma > lastDot) {
    // Comma is decimal separator (e.g. "25,25" or "1.234,56")
    normalized = trimmed.replace(/\./g, "").replace(",", ".");
  } else {
    // Dot is decimal separator or none (e.g. "1,234.56" or "1234")
    normalized = trimmed.replace(/,/g, "");
  }

  return Number(normalized);
}
