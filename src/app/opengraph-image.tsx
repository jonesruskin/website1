import { ImageResponse } from "next/og";

import { OgLanes, OgPill, OgWordmark, ogSize } from "@/lib/seo/og-image";
import { ogTheme as t } from "@/lib/seo/og-theme";
import siteConfig from "@/site.config";

export const alt = `${siteConfig.name}: every tool ends in a dead end. Make yours a doorway.`;
export const size = ogSize;
export const contentType = "image/png";

/** Default social image: the home page pitch on bone paper, with the baton crossing the lanes. */
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        backgroundColor: t.background,
        color: t.foreground,
      }}
    >
      <OgLanes />
      {/* The baton, mid-handoff, bleeding off the right edge. */}
      <div
        style={{
          display: "flex",
          position: "absolute",
          right: -70,
          top: 250,
          transform: "rotate(-14deg)",
        }}
      >
        <OgPill width={430} height={150} rotate={0} />
      </div>
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <OgWordmark size={36} />
          <div
            style={{
              display: "flex",
              fontSize: 20,
              color: t.muted,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            One script tag · 1:1 credits · Free
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 46,
              fontWeight: 700,
              color: t.muted,
              letterSpacing: "-0.04em",
              marginBottom: 6,
            }}
          >
            Every tool ends in a dead end.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 132,
              fontWeight: 700,
              lineHeight: 0.95,
              letterSpacing: "-0.055em",
            }}
          >
            Make yours a
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignSelf: "flex-start" }}>
            <div
              style={{
                display: "flex",
                fontSize: 132,
                fontWeight: 700,
                lineHeight: 0.95,
                letterSpacing: "-0.055em",
              }}
            >
              doorway.
            </div>
            <div
              style={{
                display: "flex",
                height: 14,
                marginTop: 6,
                borderRadius: 14,
                backgroundColor: t.accent,
              }}
            />
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 22, color: t.muted, letterSpacing: "0.06em" }}>
          {siteConfig.url.replace(/^https?:\/\//, "")}
        </div>
      </div>
    </div>,
    ogSize,
  );
}
