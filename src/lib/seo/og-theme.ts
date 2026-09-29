/**
 * Raw values for generated Open Graph images. The image renderer (Satori) can't
 * read CSS variables, so mirror your theme.css here. This is the only file in
 * the seo module with literal colors.
 *
 * "Relay": bone paper, near-black ink, one signal-orange baton. These are the
 * sRGB equivalents of the oklch tokens in theme.css (light scheme).
 */
export const ogTheme = {
  background: "#f8f4eb", // --background
  foreground: "#130e0a", // --foreground
  muted: "#5f564e", // --muted-foreground
  border: "#dad3c9", // --border
  accent: "#fb6c2b", // --signal
  accentInk: "#aa3606", // --signal-ink
  card: "#fdfaf4", // --card
  accentForeground: "#170d08", // --signal-foreground
} as const;
