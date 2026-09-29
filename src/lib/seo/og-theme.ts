/**
 * Raw values for generated Open Graph images. The image renderer (Satori) can't
 * read CSS variables, so mirror your theme.css here. This is the only file in
 * the seo module with literal colors.
 *
 * "Relay": bone paper, ink, one signal-orange baton (sRGB values of the oklch
 * tokens --background, --foreground, --muted-foreground, --border, --signal).
 */
export const ogTheme = {
  background: "#f8f4eb",
  card: "#fdfaf4",
  foreground: "#130e0a",
  muted: "#5f564e",
  border: "#dad3c9",
  accent: "#fb6c2b",
  accentInk: "#aa3606",
  accentForeground: "#170d08",
} as const;
