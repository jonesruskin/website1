/**
 * The journey vocabulary. A tool says what people BRING (inputs) and what they
 * LEAVE WITH (outputs) using these artifact kinds. Matching is output → input:
 * someone who just made a PDF is ready for a tool that takes a PDF.
 *
 * Shared by the server and the client (the landing page demo runs the same
 * engine), so keep this file free of server-only imports.
 */

export type ArtifactGroup =
  | "Documents"
  | "Images"
  | "Audio & video"
  | "Words"
  | "Web & code"
  | "Data"
  | "Work";

export type Artifact = { id: string; label: string; group: ArtifactGroup };

export const artifacts = [
  { id: "pdf", label: "PDF", group: "Documents" },
  { id: "document", label: "Document", group: "Documents" },
  { id: "spreadsheet", label: "Spreadsheet", group: "Documents" },
  { id: "slides", label: "Slide deck", group: "Documents" },
  { id: "signature", label: "Signed document", group: "Documents" },
  { id: "resume", label: "Résumé", group: "Documents" },
  { id: "ebook", label: "E-book", group: "Documents" },

  { id: "image", label: "Image", group: "Images" },
  { id: "photo", label: "Photo", group: "Images" },
  { id: "screenshot", label: "Screenshot", group: "Images" },
  { id: "logo", label: "Logo", group: "Images" },
  { id: "icon", label: "Icon set", group: "Images" },
  { id: "illustration", label: "Illustration", group: "Images" },
  { id: "mockup", label: "Mockup", group: "Images" },
  { id: "diagram", label: "Diagram", group: "Images" },
  { id: "palette", label: "Color palette", group: "Images" },
  { id: "font", label: "Font pairing", group: "Images" },
  { id: "qr", label: "QR code", group: "Images" },

  { id: "audio", label: "Audio", group: "Audio & video" },
  { id: "podcast", label: "Podcast episode", group: "Audio & video" },
  { id: "voice", label: "Voice recording", group: "Audio & video" },
  { id: "music", label: "Music track", group: "Audio & video" },
  { id: "video", label: "Video", group: "Audio & video" },
  { id: "clip", label: "Short clip", group: "Audio & video" },
  { id: "gif", label: "GIF", group: "Audio & video" },
  { id: "subtitles", label: "Subtitles", group: "Audio & video" },
  { id: "screen-recording", label: "Screen recording", group: "Audio & video" },

  { id: "text", label: "Plain text", group: "Words" },
  { id: "transcript", label: "Transcript", group: "Words" },
  { id: "article", label: "Article", group: "Words" },
  { id: "notes", label: "Notes", group: "Words" },
  { id: "email", label: "Email", group: "Words" },
  { id: "newsletter", label: "Newsletter issue", group: "Words" },
  { id: "social-post", label: "Social post", group: "Words" },
  { id: "translation", label: "Translation", group: "Words" },
  { id: "summary", label: "Summary", group: "Words" },
  { id: "idea", label: "Idea", group: "Words" },

  { id: "website", label: "Website", group: "Web & code" },
  { id: "landing-page", label: "Landing page", group: "Web & code" },
  { id: "link", label: "Link", group: "Web & code" },
  { id: "code", label: "Code", group: "Web & code" },
  { id: "api", label: "API", group: "Web & code" },
  { id: "app", label: "App build", group: "Web & code" },
  { id: "domain", label: "Domain", group: "Web & code" },
  { id: "form", label: "Form", group: "Web & code" },

  { id: "data", label: "Dataset", group: "Data" },
  { id: "csv", label: "CSV", group: "Data" },
  { id: "json", label: "JSON", group: "Data" },
  { id: "chart", label: "Chart", group: "Data" },
  { id: "survey-results", label: "Survey results", group: "Data" },
  { id: "analytics", label: "Analytics report", group: "Data" },

  { id: "task-list", label: "Task list", group: "Work" },
  { id: "meeting", label: "Meeting", group: "Work" },
  { id: "schedule", label: "Schedule", group: "Work" },
  { id: "invoice", label: "Invoice", group: "Work" },
  { id: "plan", label: "Plan", group: "Work" },
  { id: "portfolio", label: "Portfolio", group: "Work" },
  { id: "audience", label: "Audience list", group: "Work" },
] as const satisfies readonly Artifact[];

export type ArtifactId = (typeof artifacts)[number]["id"];

export const artifactIds = artifacts.map((a) => a.id) as readonly string[];

const byId = new Map<string, Artifact>(artifacts.map((a) => [a.id, a]));

export function isArtifact(id: string): id is ArtifactId {
  return byId.has(id);
}

export function artifactLabel(id: string) {
  return byId.get(id)?.label ?? id;
}

export const artifactGroups = [
  "Documents",
  "Images",
  "Audio & video",
  "Words",
  "Web & code",
  "Data",
  "Work",
] as const satisfies readonly ArtifactGroup[];

/** Tool categories. Two tools in one category are competitors and never paired by default. */
export const categories = [
  { id: "documents", label: "Documents & PDF" },
  { id: "images", label: "Images & design" },
  { id: "audio", label: "Audio & podcasts" },
  { id: "video", label: "Video" },
  { id: "writing", label: "Writing" },
  { id: "developer", label: "Developer tools" },
  { id: "data", label: "Data & spreadsheets" },
  { id: "marketing", label: "Marketing & social" },
  { id: "productivity", label: "Productivity" },
  { id: "web", label: "Websites & no-code" },
  { id: "education", label: "Learning" },
  { id: "other", label: "Something else" },
] as const;

export type CategoryId = (typeof categories)[number]["id"];

export const categoryIds = categories.map((c) => c.id) as readonly string[];

export function categoryLabel(id: string) {
  return categories.find((c) => c.id === id)?.label ?? id;
}
