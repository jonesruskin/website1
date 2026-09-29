/** Display helpers shared by server and client components of the maker app. */

export const ledgerReasons: Record<string, { label: string; hint: string }> = {
  starter: { label: "Starter credits", hint: "Welcome gift for a new tool" },
  click_sent: { label: "Passed a user on", hint: "Someone clicked a card shown in your tool" },
  click_received: {
    label: "Received a visitor",
    hint: "Someone clicked your card in another tool",
  },
  bonus: { label: "Bonus", hint: "Granted by Baton" },
  adjustment: { label: "Adjustment", hint: "Corrected by Baton" },
};

export function ledgerReason(reason: string) {
  return ledgerReasons[reason]?.label ?? reason;
}

/** "https://www.example.com/app" → "example.com". */
export function hostOf(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

const numberFormat = new Intl.NumberFormat("en-US");

export function formatNumber(value: number) {
  return numberFormat.format(value);
}

/** "+3", "−1", "0": a real minus sign so it aligns in mono columns. */
export function formatDelta(value: number) {
  if (value > 0) return `+${formatNumber(value)}`;
  if (value < 0) return `−${formatNumber(Math.abs(value))}`;
  return "0";
}

/** "Sep 29" from a YYYY-MM-DD key (UTC). */
export function shortDate(key: string) {
  return new Date(`${key}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function lane(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function plural(count: number, one: string, many = `${one}s`) {
  return `${formatNumber(count)} ${count === 1 ? one : many}`;
}
