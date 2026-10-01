/**
 * Static preview of the public site for GitHub Pages.
 *
 *   node scripts/static-preview.mjs [outDir] [basePath]
 *   (defaults: .preview-out and /website1, i.e. https://<user>.github.io/website1/)
 *
 * Builds with a base path, serves the production build locally, crawls every
 * public page reachable from the home page, and writes plain HTML plus the
 * static assets. Server features (sign-up, dashboard, forms, the card API) are
 * not part of a static host, and the site shows a banner saying so.
 */
import { spawn, execSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const outDir = path.resolve(process.argv[2] ?? ".preview-out");
const basePath = process.argv[3] ?? "/website1";
const port = 3999;
const origin = `http://localhost:${port}`;
const siteUrl = process.env.PREVIEW_SITE_URL ?? `https://jonesruskin.github.io${basePath}`;

const env = {
  ...process.env,
  NEXT_BASE_PATH: basePath,
  NEXT_PUBLIC_STATIC_PREVIEW: "1",
  NEXT_PUBLIC_SITE_URL: siteUrl,
  SKIP_ENV_VALIDATION: "1",
  NEXT_TELEMETRY_DISABLED: "1",
  // Throwaway: the auth pages only render HTML here, and nothing signs in.
  BETTER_AUTH_SECRET: randomBytes(32).toString("base64"),
};

/** Pages to start from; everything linked from them is crawled too. */
const seeds = ["/", "/trails", "/makers", "/pricing", "/docs", "/blog", "/faq", "/changelog", "/sign-up", "/sign-in"];
/** Routes that need a server or a signed-in user: never part of the preview. */
const skip = /^\/(api|dev|r|billing|dashboard|tools|network|credits|settings|admin|notifications|onboarding|invite)(\/|$)/;
/** Extra static files the pages fetch at runtime. */
const extras = ["/docs/search-index.json", "/icon.svg", "/opengraph-image"];

function run(cmd) {
  execSync(cmd, { stdio: "inherit", env });
}

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`${origin}${basePath}`);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Preview server did not start.");
}

/** Prefixes root-relative URLs that don't carry the base path yet (plain <a href="/…">). */
function rebase(html) {
  return html.replace(/(\s(?:href|src|action|poster)=")(\/(?!\/)[^"]*)"/g, (match, attr, url) =>
    url === basePath || url.startsWith(`${basePath}/`) ? match : `${attr}${basePath}${url}"`,
  );
}

function fileFor(route) {
  const clean = route.replace(/[?#].*$/, "").replace(/\/$/, "");
  if (/\.[a-z0-9]+$/i.test(clean)) return path.join(outDir, clean);
  return path.join(outDir, clean, "index.html");
}

async function main() {
  rmSync(".next", { recursive: true, force: true });
  run("pnpm next build");

  const server = spawn("pnpm", ["next", "start", "-p", String(port)], { env, stdio: "ignore" });
  try {
    await waitForServer();
    rmSync(outDir, { recursive: true, force: true });
    mkdirSync(outDir, { recursive: true });

    const queue = [...seeds];
    const seen = new Set();
    let pages = 0;
    while (queue.length) {
      const route = queue.shift();
      if (seen.has(route) || skip.test(route)) continue;
      seen.add(route);
      // Next serves the base path itself without a trailing slash ("/website1", not "/website1/").
      const url = `${origin}${basePath}${route === "/" ? "" : route}`;
      const res = await fetch(url, { redirect: "manual" });
      if (res.status !== 200 || !(res.headers.get("content-type") ?? "").includes("text/html")) continue;
      const html = await res.text();
      for (const m of html.matchAll(/href="([^"]+)"/g)) {
        let href = m[1].replace(/&amp;/g, "&");
        if (!href.startsWith("/") || href.startsWith("//")) continue;
        if (href.startsWith(basePath)) href = href.slice(basePath.length) || "/";
        href = href.replace(/[?#].*$/, "");
        if (!href || href.startsWith("/_next") || /\.(xml|txt|png|svg|ico|json|css|js)$/.test(href)) continue;
        if (!seen.has(href)) queue.push(href);
      }
      const file = fileFor(route);
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, rebase(html));
      pages++;
    }

    for (const route of extras) {
      const res = await fetch(`${origin}${basePath}${route}`);
      if (!res.ok) continue;
      const target = route === "/opengraph-image" ? path.join(outDir, "opengraph-image") : fileFor(route);
      mkdirSync(path.dirname(target), { recursive: true });
      writeFileSync(target, Buffer.from(await res.arrayBuffer()));
    }

    const notFound = await fetch(`${origin}${basePath}/__preview-404`);
    writeFileSync(path.join(outDir, "404.html"), rebase(await notFound.text()));

    cpSync(".next/static", path.join(outDir, "_next/static"), { recursive: true });
    if (existsSync("public")) cpSync("public", outDir, { recursive: true });
    // GitHub Pages runs Jekyll by default, which drops folders starting with "_" (like _next).
    writeFileSync(path.join(outDir, ".nojekyll"), "");

    console.log(`\n✔ ${pages} pages written to ${path.relative(process.cwd(), outDir)} for ${siteUrl}`);
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
