import { ImageResponse } from "next/og";

import { artifactLabel } from "@/lib/baton/taxonomy";
import { ogSize } from "@/lib/seo/og-image";
import { ogTheme as t } from "@/lib/seo/og-theme";
import siteConfig from "@/site.config";

import type { Trail } from "./trails";

/** Social card for one trail: bone paper, ink type, and the baton running the steps. */
export function renderTrailOgImage(
  trail: Pick<Trail, "title" | "promise" | "from" | "to" | "steps">,
) {
  const count = trail.steps.length;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 80px 72px",
        backgroundColor: t.background,
        color: t.foreground,
        position: "relative",
      }}
    >
      {[150, 450].map((top) => (
        <div
          key={top}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top,
            height: 2,
            backgroundColor: t.border,
            display: "flex",
          }}
        />
      ))}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              width: 56,
              height: 24,
              borderRadius: 12,
              backgroundColor: t.accent,
            }}
          />
          <div style={{ display: "flex", fontSize: 34, fontWeight: 800, letterSpacing: "-0.03em" }}>
            {siteConfig.name}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: t.accentInk,
          }}
        >
          Trails · {count} steps
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div
          style={{
            display: "flex",
            fontSize: trail.title.length > 34 ? 78 : 96,
            fontWeight: 800,
            lineHeight: 0.98,
            letterSpacing: "-0.045em",
          }}
        >
          {trail.title}
        </div>
        <div
          style={{ display: "flex", fontSize: 32, lineHeight: 1.3, color: t.muted, maxWidth: 940 }}
        >
          {trail.promise.length > 120 ? `${trail.promise.slice(0, 117)}…` : trail.promise}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {artifactLabel(trail.from)}
        </div>
        <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
          {trail.steps.map((step, index) => (
            <div key={index} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={{ display: "flex", flex: 1, height: 4, backgroundColor: t.foreground }} />
              <div
                style={{
                  display: "flex",
                  width: index === count - 1 ? 40 : 26,
                  height: index === count - 1 ? 40 : 26,
                  borderRadius: 40,
                  backgroundColor: index === count - 1 ? t.accent : t.background,
                  border: `4px solid ${t.foreground}`,
                }}
              />
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: t.accentInk,
          }}
        >
          {artifactLabel(trail.to)}
        </div>
      </div>
    </div>,
    ogSize,
  );
}
