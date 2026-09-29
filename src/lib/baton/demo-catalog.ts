/**
 * Examples of tools on the network: ARCHETYPES, not brands. The landing page demo
 * runs the real `rankNextSteps` over this catalog so visitors can see how journey
 * matching behaves. Every entry is a made-up kind of tool with its own owner,
 * 10 starter credits and a card the way its maker might write it.
 *
 * Shared with the client, so keep this file free of server-only imports.
 */
import type { MatchCandidate } from "./match";
import type { CategoryId } from "./taxonomy";

export type DemoTool = MatchCandidate & {
  name: string;
  category: CategoryId;
  /** The card headline this kind of tool would write. */
  pitch: string;
  cta: string;
};

type Seed = Omit<DemoTool, "ownerId" | "credits" | "status">;

const seeds: Seed[] = [
  {
    id: "e-signature",
    name: "E-signature tool",
    category: "productivity",
    inputs: ["pdf", "document"],
    outputs: ["signature"],
    pitch: "Sign it in 30 seconds",
    cta: "Open",
  },
  {
    id: "pdf-compressor",
    name: "PDF compressor",
    category: "documents",
    inputs: ["pdf"],
    outputs: ["pdf"],
    pitch: "Shrink it before you send it",
    cta: "Compress",
  },
  {
    id: "document-scanner",
    name: "Document scanner",
    category: "documents",
    inputs: ["photo", "image"],
    outputs: ["pdf", "document"],
    pitch: "Turn that photo into a clean PDF",
    cta: "Scan it",
  },
  {
    id: "ocr",
    name: "OCR tool",
    category: "documents",
    inputs: ["pdf", "image", "screenshot"],
    outputs: ["text", "document"],
    pitch: "Make every word selectable",
    cta: "Extract text",
  },
  {
    id: "transcription",
    name: "Transcription tool",
    category: "audio",
    inputs: ["audio", "voice", "podcast", "video"],
    outputs: ["transcript", "subtitles"],
    pitch: "Get the transcript in minutes",
    cta: "Transcribe",
  },
  {
    id: "audio-cleaner",
    name: "Audio cleaner",
    category: "audio",
    inputs: ["audio", "voice", "podcast"],
    outputs: ["audio"],
    pitch: "Lose the hiss and the hum",
    cta: "Clean it up",
  },
  {
    id: "podcast-host",
    name: "Podcast host",
    category: "audio",
    inputs: ["podcast", "audio"],
    outputs: ["link"],
    pitch: "Publish this episode today",
    cta: "Publish",
  },
  {
    id: "background-remover",
    name: "Background remover",
    category: "images",
    inputs: ["image", "photo"],
    outputs: ["image"],
    pitch: "Cut it out in one click",
    cta: "Remove background",
  },
  {
    id: "image-compressor",
    name: "Image compressor",
    category: "images",
    inputs: ["image", "photo", "screenshot"],
    outputs: ["image"],
    pitch: "Half the weight, same look",
    cta: "Compress",
  },
  {
    id: "logo-maker",
    name: "Logo maker",
    category: "images",
    inputs: ["idea", "palette", "font"],
    outputs: ["logo", "image"],
    pitch: "Give the idea a mark",
    cta: "Design a logo",
  },
  {
    id: "mockup-generator",
    name: "Mockup generator",
    category: "images",
    inputs: ["screenshot", "image", "logo"],
    outputs: ["mockup"],
    pitch: "Put it on a device",
    cta: "Make a mockup",
  },
  {
    id: "video-captioner",
    name: "Video captioner",
    category: "video",
    inputs: ["video", "clip", "subtitles"],
    outputs: ["video", "subtitles"],
    pitch: "Captions that burn in",
    cta: "Add captions",
  },
  {
    id: "clip-maker",
    name: "Clip maker",
    category: "video",
    inputs: ["video", "transcript", "podcast"],
    outputs: ["clip"],
    pitch: "Pull the best 30 seconds",
    cta: "Cut a clip",
  },
  {
    id: "gif-maker",
    name: "GIF maker",
    category: "video",
    inputs: ["video", "screen-recording", "clip"],
    outputs: ["gif"],
    pitch: "Loop it into a GIF",
    cta: "Make a GIF",
  },
  {
    id: "invoice-generator",
    name: "Invoice generator",
    category: "productivity",
    inputs: ["spreadsheet", "plan"],
    outputs: ["invoice", "pdf"],
    pitch: "Bill for it while it's fresh",
    cta: "Create invoice",
  },
  {
    id: "resume-builder",
    name: "Résumé builder",
    category: "writing",
    inputs: ["text", "notes"],
    outputs: ["resume", "pdf"],
    pitch: "Shape it into a résumé",
    cta: "Build it",
  },
  {
    id: "grammar-checker",
    name: "Grammar checker",
    category: "writing",
    inputs: ["text", "article", "email", "newsletter", "notes"],
    outputs: ["text", "article"],
    pitch: "One last read for typos",
    cta: "Check it",
  },
  {
    id: "translator",
    name: "Translator",
    category: "education",
    inputs: ["text", "article", "subtitles", "transcript", "document"],
    outputs: ["translation"],
    pitch: "Reach readers in another language",
    cta: "Translate",
  },
  {
    id: "summarizer",
    name: "Summarizer",
    category: "productivity",
    inputs: ["text", "transcript", "article", "notes", "pdf"],
    outputs: ["summary"],
    pitch: "The short version, please",
    cta: "Summarize",
  },
  {
    id: "social-scheduler",
    name: "Social scheduler",
    category: "marketing",
    inputs: ["social-post", "image", "clip", "article"],
    outputs: ["schedule"],
    pitch: "Line it up for the week",
    cta: "Schedule",
  },
  {
    id: "landing-page-builder",
    name: "Landing page builder",
    category: "web",
    inputs: ["logo", "text", "image", "idea", "mockup"],
    outputs: ["landing-page", "website"],
    pitch: "Put it on a page",
    cta: "Start a page",
  },
  {
    id: "domain-finder",
    name: "Domain finder",
    category: "web",
    inputs: ["idea", "logo", "website", "landing-page"],
    outputs: ["domain"],
    pitch: "Find the name that's free",
    cta: "Search domains",
  },
  {
    id: "chart-maker",
    name: "Chart maker",
    category: "data",
    inputs: ["csv", "spreadsheet", "data", "json"],
    outputs: ["chart", "image"],
    pitch: "See the numbers, not the rows",
    cta: "Chart it",
  },
  {
    id: "qr-generator",
    name: "QR code generator",
    category: "marketing",
    inputs: ["link", "website", "landing-page"],
    outputs: ["qr", "image"],
    pitch: "Scan to open, anywhere",
    cta: "Make a QR code",
  },
];

/** 24 archetypes, each with a distinct owner, 10 starter credits and active status. */
export const demoCatalog: readonly DemoTool[] = seeds.map((seed, index) => ({
  ...seed,
  ownerId: `demo-owner-${String(index + 1).padStart(2, "0")}`,
  credits: 10,
  status: "active",
}));

/** Artifacts offered first in the demo's chip picker. */
export const popularArtifacts = [
  "pdf",
  "image",
  "audio",
  "video",
  "transcript",
  "text",
  "spreadsheet",
  "logo",
  "slides",
  "csv",
  "article",
  "website",
] as const;
