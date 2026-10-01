# Baton

**The recommendation network for the moment your tool finishes its job.**

Every tool on the internet ends in a dead end: the file downloads, the transcript appears, and
then nothing. That *success moment* is the most valuable attention a user gives you. They're
satisfied, focused, and they have a next job.

Baton turns it into a doorway:

1. A maker adds one script tag and calls `baton.pass()` when their tool finishes.
2. Baton shows **one** card for the most useful next tool. It matches on the user's journey,
   not their identity: what your tool outputs (a PDF) connects to what another tool takes in
   (e-signature).
3. Clicks move credits **1:1**. Send a visitor, earn a credit; receive one, spend a credit.
   Free forever on the Relay plan, with no ads, no tracking cookies and no pay-to-rank.

Baton also has a people-facing side. **Trails** (`/trails`) are curated journeys through real,
free tools for everyday jobs.

```html
<script src="https://toolbaton.com/embed.js" data-key="bk_…" async></script>
<script>
  // when your tool finishes its job:
  window.baton?.pass({ ctx: "pdf" });
</script>
```

### Where the product lives

| Path | What it is |
| --- | --- |
| `src/lib/baton/match.ts` | The matching engine (pure, unit-tested; also powers the landing page demo) |
| `src/lib/baton/taxonomy.ts` | The journey vocabulary: artifacts and categories |
| `src/lib/baton/engine.ts` | Impressions, signed clicks and the credit ledger |
| `src/app/api/baton/v1/card` · `src/app/r/[token]` · `src/app/embed.js` | Public embed endpoints |
| `src/app/(app)/{tools,network,credits}` | The maker app |
| `src/app/(site)` | Marketing site, trails, makers page, docs, blog |
| `src/db/schema/baton.ts` | Tools, impressions, clicks, ledger, handshakes, blocks |

Design language and conventions for contributors (human or AI) are in [AGENTS.md](AGENTS.md).
To go live on a near-zero budget (Netlify, Neon, Resend, Dodo Payments), follow [DEPLOY.md](DEPLOY.md).

Built on [site-forge](https://github.com/jonesruskin/site-forge) (preset: `saas`). All of the
code in this repository is yours to change: nothing is hidden in a package.

## Quick start

```sh
pnpm install
cp .env.example .env.local   # optional in development: modules fall back to local behavior
pnpm dev
```

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm typecheck` | Generate route types and type-check |
| `pnpm lint` | ESLint |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm site doctor` | Check env vars, dependencies and module requirements |

## Modules

<!-- site-forge:modules:start -->
| Module | What it does | Routes |
| --- | --- | --- |
| [`seo`](.site/modules/seo.md) | sitemap.xml, robots.txt (no-index outside production), JSON-LD helpers and generated Open Graph images. | `/sitemap.xml` `/robots.txt` `/opengraph-image` |
| [`analytics`](.site/modules/analytics.md) | One track() for Plausible, PostHog, Google Analytics 4 or Umami, chosen by env vars; waits for cookie consent when the provider needs it; logs events locally in dev. |  |
| [`ci`](.site/modules/ci.md) | Lint, typecheck, test and build on every push and pull request, with cached installs and Next.js builds, least-privilege tokens and grouped Dependabot updates. |  |
| [`vercel`](.site/modules/vercel.md) | vercel.json that checks production env vars before building, security-minded defaults, and a step-by-step deploy guide. |  |
| [`mdx`](.site/modules/mdx.md) | Typed MDX collections: Zod-validated frontmatter, drafts, TOC, reading time, token-themed code highlighting, RSS helper. |  |
| [`legal`](.site/modules/legal.md) | Privacy policy, terms of service and cookie policy as editable MDX templates filled from site.config. | `/legal/privacy` `/legal/terms` `/legal/cookies` |
| [`email`](.site/modules/email.md) | Send React Email templates through Resend. In development, mail lands in a local outbox at /dev/outbox. | `/dev/outbox` |
| [`rate-limit`](.site/modules/rate-limit.md) | Sliding-window rate limits for actions and API routes. Upstash Redis in production, in-memory locally. |  |
| [`contact`](.site/modules/contact.md) | Contact page and form with layered spam protection (honeypot, timing, rate limit, optional Turnstile) and email delivery. | `/contact` |
| [`blog`](.site/modules/blog.md) | MDX blog with static pagination, tags, reading time, per-post OG images, RSS, JSON-LD and sitemap entries. | `/blog` `/blog/[slug]` `/blog/tags/[tag]` `/blog/page/[page]` `/blog/rss.xml` |
| [`changelog`](.site/modules/changelog.md) | Release notes from MDX: dated entries with versions and change types, deep links, RSS feed. | `/changelog` `/changelog/rss.xml` |
| [`faq`](.site/modules/faq.md) | Typed FAQ data source (content/faq.json) grouped by category, a /faq page and FAQPage structured data. | `/faq` |
| [`database`](.site/modules/database.md) | Drizzle ORM on Postgres (Neon, Supabase or any Postgres). Zero-setup embedded PGlite in development with automatic schema push. |  |
| [`auth`](.site/modules/auth.md) | Better Auth: email + password with verification, magic links, Google and GitHub OAuth, password reset, protected routes. | `/sign-in` `/sign-up` `/forgot-password` `/reset-password` `/verify-email` `/api/auth/*` |
| [`dashboard`](.site/modules/dashboard.md) | Signed-in app area: sidebar + topbar layout, nav from site.config, overview with widget and topbar slots for other modules. | `/dashboard` |
| [`settings`](.site/modules/settings.md) | Account settings: profile, email change, password, active sessions with revoke, account deletion. Tabs other modules extend. | `/settings` `/settings/security` `/settings/account` |
| [`payments`](.site/modules/payments.md) | Provider-agnostic checkout, customer portal and webhooks (Stripe adapter), with a mock provider so billing works locally with zero keys. | `/api/payments/webhook` `/dev/checkout/[id]` `/dev/billing-portal` |
| [`billing`](.site/modules/billing.md) | Subscriptions from plans in site.config: pricing page, checkout, webhooks, customer portal, entitlements and limits. | `/pricing` `/settings/billing` `/billing/checkout` `/billing/portal` |
| [`teams`](.site/modules/teams.md) | Organizations with roles (owner, admin, member), email invitations, team switcher and team settings, on Better Auth's organization plugin. | `/settings/team` `/invite/[id]` |
| [`admin`](.site/modules/admin.md) | Admin area on Better Auth's admin plugin: user search, roles, ban/unban, session revocation, impersonation with a stop banner. | `/admin` `/admin/users` |
| [`notifications`](.site/modules/notifications.md) | Notification inbox: notify(userId, …) from anywhere, a bell with unread count in the top bar, and a /notifications page. | `/notifications` |
| [`transactional-emails`](.site/modules/transactional-emails.md) | Welcome email after verification, plus /dev/emails: a gallery previewing every email template installed by any module. | `/dev/emails` |
| [`onboarding`](.site/modules/onboarding.md) | A focused first-run questionnaire configured in site.config.ts, plus a setup checklist on the dashboard that other modules add tasks to. | `/onboarding` |
| [`api`](.site/modules/api.md) | Hashed API keys with scopes and expiry, an apiRoute() helper (auth, Zod validation, rate limits, problem+json errors), /api/v1/me and an API keys settings tab. | `/settings/api-keys` `/api/v1/me` |
| [`docs`](.site/modules/docs.md) | Documentation from MDX folders: sidebar, prev/next, TOC, edit links and ⌘K client-side search (static index, lazy-loaded). | `/docs` `/docs/[slug]` `/docs/[slug]/[page]` `/docs/search-index.json` |
<!-- site-forge:modules:end -->

## Make it yours

- **Look**: everything visual lives in `src/styles/theme.css`. Turn the dials at the top first (hue, tint, accent, radius, density, shadow, motion). With the `theme-lab` module, open `/lab` in development to tune them live.
- **Content & navigation**: `site.config.ts` is the single source of truth for name, URLs, navigation, SEO defaults, feature flags and module settings.
- **Environment**: `.env.example` lists every variable with a description. `pnpm site doctor` tells you what's missing.

## Grow the site

```sh
pnpm site list              # modules, sections, presets and themes
pnpm site add blog newsletter
pnpm site add section:pricing
pnpm site theme editorial   # or tweak dials: pnpm site theme --hue 25 --accent 0.18
pnpm site diff blog         # compare your copy with the registry
pnpm site remove newsletter
```
