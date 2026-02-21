/**
 * Formats a YYYY-MM-DD date string for display: "Today", "Yesterday",
 * short form for the last week ("Mon 10 Feb"), or readable for older dates.
 */
export function formatRelativeDate(dateStr: string): string {
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) {
    return dateStr;
  }
  const [y, m, d] = parts;
  const inputDay = new Date(y, m - 1, d);
  inputDay.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - inputDay.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays >= 2 && diffDays <= 6) {
    const weekday = inputDay.toLocaleDateString("en-US", { weekday: "short" });
    const day = inputDay.getDate();
    const month = inputDay.toLocaleDateString("en-US", { month: "short" });
    return `${weekday} ${day} ${month}`;
  }

  const sameYear = today.getFullYear() === inputDay.getFullYear();
  return inputDay.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  });
}
