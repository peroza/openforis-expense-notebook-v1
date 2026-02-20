/**
 * Parses a user-entered amount string (e.g. "1,234.56" or "1 234") into a number.
 * Strips commas and spaces so locale-style input is accepted.
 */
export function parseAmountInput(value: string): number {
  const normalized = value.trim().replace(/,/g, "").replace(/\s/g, "");
  return Number(normalized);
}
