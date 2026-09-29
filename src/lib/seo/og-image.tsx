import { ImageResponse } from "next/og";

import siteConfig from "@/site.config";

import { ogTheme as t } from "./og-theme";

export const ogSize = { width: 1200, height: 630 };

type OgImageInput = {
  title: string;
  /** Small label above the title, e.g. "Blog" or a date. */
  eyebrow?: string;
  description?: string;
};

/** The baton: an orange capsule with a grip band. */
export function OgPill({
  width = 72,
  height = 26,
  rotate = -28,
}: {
  width?: number;
  height?: number;
  rotate?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        width,
        height,
        borderRadius: height,
        backgroundColor: t.accent,
        transform: `rotate(${rotate}deg)`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: Math.round(width * 0.68),
          width: Math.round(width * 0.08),
          backgroundColor: t.accentForeground,
          opacity: 0.25,
        }}
      />
    </div>
  );
}

/** Lane lines behind the card, like a running track. */
export function OgLanes({ gap = 105 }: { gap?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", position: "absolute", inset: 0 }}>
      {Array.from({ length: Math.ceil(ogSize.height / gap) }, (_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            width: "100%",
            height: gap,
            borderBottom: `1px solid ${t.border}`,
          }}
        />
      ))}
    </div>
  );
}

/** The wordmark: tilted pill and "Baton". */
export function OgWordmark({ size = 34 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <OgPill width={Math.round(size * 1.15)} height={Math.round(size * 0.48)} />
      <div style={{ display: "flex", fontSize: size, fontWeight: 700, letterSpacing: "-0.04em" }}>
        {siteConfig.name}
      </div>
    </div>
  );
}

/**
 * The shared social card. Use it from any `opengraph-image.tsx`:
 *
 *   export default async function Image({ params }) {
 *     const post = await getPost((await params).slug);
 *     return renderOgImage({ eyebrow: "Blog", title: post.title });
 *   }
 */
export function renderOgImage({ title, eyebrow, description }: OgImageInput) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        backgroundColor: t.background,
        color: t.foreground,
      }}
    >
      <OgLanes />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "64px 80px",
          position: "relative",
        }}
      >
        <OgWordmark />
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {eyebrow && (
            <div
              style={{
                display: "flex",
                fontSize: 24,
                color: t.accentInk,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                fontWeight: 700,
              }}
            >
              {eyebrow}
            </div>
          )}
          <div
            style={{
              display: "flex",
              fontSize: title.length > 60 ? 64 : 84,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: "-0.045em",
              maxWidth: 980,
            }}
          >
            {title}
          </div>
          {description && (
            <div
              style={{
                display: "flex",
                fontSize: 28,
                color: t.muted,
                lineHeight: 1.35,
                maxWidth: 900,
              }}
            >
              {description.length > 140 ? `${description.slice(0, 137)}…` : description}
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 22, color: t.muted, letterSpacing: "0.06em" }}>
            {siteConfig.url.replace(/^https?:\/\//, "")}
          </div>
          <OgPill width={120} height={40} rotate={0} />
        </div>
      </div>
    </div>,
    ogSize,
  );
}
