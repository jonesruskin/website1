import type { NextConfig } from "next";

import { moduleNextConfig, nextPlugins } from "./src/generated/next";
import { securityHeaders } from "./src/lib/security-headers";

/**
 * Static preview builds (GitHub Pages, see scripts/static-preview.mjs) are served
 * from a sub-path such as /website1 and have no image optimizer.
 */
const basePath = process.env.NEXT_BASE_PATH || undefined;
const staticPreview = process.env.NEXT_PUBLIC_STATIC_PREVIEW === "1";

const config: NextConfig = {
  ...(basePath && { basePath }),
  // Client code that builds URLs by hand (e.g. docs search) reads this.
  env: { NEXT_PUBLIC_BASE_PATH: basePath ?? "" },
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: moduleNextConfig.serverExternalPackages,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: moduleNextConfig.imageRemotePatterns,
    ...(staticPreview && { unoptimized: true }),
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders(moduleNextConfig.csp) }];
  },
};

export default nextPlugins.reduce((acc, plugin) => plugin(acc), config);
