import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/url";

import { getTrails, trailHref } from "./trails";

/** /trails plus one entry per trail. Merged into /sitemap.xml by src/app/sitemap.ts. */
export async function trailsSitemap(): Promise<MetadataRoute.Sitemap> {
  const trails = await getTrails();
  return [
    { url: absoluteUrl("/trails"), changeFrequency: "monthly", priority: 0.8 },
    ...trails.map((trail) => ({
      url: absoluteUrl(trailHref(trail)),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
