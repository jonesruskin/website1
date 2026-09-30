# Deploying Baton

The launch stack is chosen for a business registered in India, running at **$0/month plus
about $11/year for the domain** until traffic or revenue justify more.

| Need | Service | Cost | Free-tier limit to watch |
| --- | --- | --- | --- |
| Domain | [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) | .com ≈ $10.44/yr (≈ $11.15 from 1 Nov 2026), same price on renewal | – |
| Inbox `hello@yourdomain` | Cloudflare Email Routing → your Gmail | $0 | Receives only; replies go out from Gmail |
| Hosting | [Netlify](https://www.netlify.com/pricing/) free (commercial use allowed) | $0 | 300 credits/mo (≈ 100 GB bandwidth) |
| Database | [Neon](https://neon.com/pricing) Postgres free | $0 | 0.5 GB storage, 100 CU-hours/mo (scales to zero when idle) |
| Rate limits | [Upstash Redis](https://upstash.com/pricing/redis) free | $0 | 500k commands/mo (≈ 5k card requests/day) |
| Email | [Resend](https://resend.com/pricing) free | $0 | 3,000/mo, 100/day |
| Payments | [Dodo Payments](https://dodopayments.com) (merchant of record) | 4% + 40¢ per sale (+1.5% international, +0.5% subscriptions) | Pays out to an Indian bank account; handles VAT/GST worldwide |
| Analytics | [Umami Cloud](https://umami.is/pricing) free | $0 | 100k events/mo |
| Bot protection | Cloudflare Turnstile | $0 | – |

**Why Dodo, not Stripe:** Stripe has been invite-only in India since May 2024. A merchant of
record is the legal seller, so it collects and files sales tax for every country and pays you
out. [Polar](https://polar.sh) is a drop-in alternative with the same base fee. The adapter
contract is `src/lib/payments/types.ts`, and Stripe stays wired as a fallback.

**Why not Vercel's free plan:** Vercel Hobby forbids commercial use, and Baton sells plans.
If Netlify ever falls short, see [Fallbacks](#fallbacks).

## Steps

### 1. Domain (about 10 minutes)
1. Create a Cloudflare account, go to **Domain Registration → Register Domains**, and buy the
   name.
2. **Email → Email Routing**: route `hello@yourdomain` to your personal inbox.
3. Replace the placeholder domain: `grep -rl "baton.run" content src site.config.ts`. The live
   URL itself comes from `NEXT_PUBLIC_SITE_URL`.

### 2. Database: Neon
1. [console.neon.tech](https://console.neon.tech) → New project (region: closest to Netlify's
   functions, e.g. US East).
2. Copy the **pooled** connection string. This is `DATABASE_URL`.
3. Create the tables once, from your machine: `DATABASE_URL="…" pnpm db:migrate`. It runs the
   committed SQL in `drizzle/`. After any schema change, run `pnpm db:generate` and commit the
   new SQL.

### 3. Rate limits: Upstash
[console.upstash.com](https://console.upstash.com) → Redis → Create database → REST API. Copy
`UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. Without them, limits live in memory
on each serverless instance, which is not safe in production.

### 4. Email: Resend
1. [resend.com/domains](https://resend.com/domains) → add your domain and add the DNS records
   it shows in Cloudflare.
2. Create an API key → `RESEND_API_KEY`. Set `EMAIL_FROM="Baton <hello@yourdomain>"` and
   `CONTACT_TO_EMAIL=hello@yourdomain`.

### 5. Payments: Dodo
1. Sign up at [dodopayments.com](https://dodopayments.com), complete business verification
   (KYC), and add your Indian bank account for payouts.
2. In **test mode**, create 4 subscription products that match `site.config.ts → billing`:
   - Anchor $12/month and $120/year
   - Studio $39/month and $390/year
3. Set `DODO_PRODUCTS` to map billing's price keys to the product ids:
   ```
   DODO_PRODUCTS=pro_monthly=pdt_…,pro_yearly=pdt_…,enterprise_monthly=pdt_…,enterprise_yearly=pdt_…
   ```
   (`pro` is Anchor's plan id and `enterprise` is Studio's.)
4. **Developers → API keys**: create a key → `DODO_PAYMENTS_API_KEY`. Set
   `DODO_PAYMENTS_ENVIRONMENT=test_mode`.
5. **Developers → Webhooks**: add `https://yourdomain/api/payments/webhook`, subscribe to
   `subscription.*`, `payment.succeeded` and `payment.failed`, and copy the signing secret →
   `DODO_PAYMENTS_WEBHOOK_KEY`.
6. Test a purchase with a test card, and check that `/settings/billing` shows the plan.
7. When ready, repeat steps 2–5 in **live mode** and set `DODO_PAYMENTS_ENVIRONMENT=live_mode`.
   Live products have different ids, so update `DODO_PRODUCTS` too.

### 6. Auth
- `BETTER_AUTH_SECRET`: run `openssl rand -base64 32`.
- `BETTER_AUTH_URL=https://yourdomain`
- `ADMIN_EMAILS=you@yourdomain`: the admin area unlocks for these emails.
- Optional: Google/GitHub sign-in keys (`GOOGLE_CLIENT_ID`…, see `.env.example`).

### 7. Hosting: Netlify
1. [app.netlify.com](https://app.netlify.com) → Add new site → Import from GitHub →
   `jonesruskin/website1`. Build settings come from `netlify.toml`.
2. **Site configuration → Environment variables**: add everything above, plus
   `NEXT_PUBLIC_SITE_URL=https://yourdomain`. For the *Deploy previews* and *Branch deploys*
   contexts, use your Dodo **test-mode** key and products. Previews already capture email
   instead of sending it.
3. Deploy. The build runs `pnpm env:check` first and stops with a clear list if anything is
   missing.
4. **Domain management**: add your domain and follow the DNS instructions (a CNAME in
   Cloudflare, DNS-only/grey cloud).

### 8. Optional extras (all free)
- **Analytics:** [Umami Cloud](https://cloud.umami.is) → add the site →
  `NEXT_PUBLIC_UMAMI_WEBSITE_ID`. It's cookieless, so no banner is needed.
- **Bot protection:** Cloudflare Turnstile → `NEXT_PUBLIC_TURNSTILE_SITE_KEY` +
  `TURNSTILE_SECRET_KEY` (adds an invisible challenge to the contact form).

## Before you announce
- [ ] `pnpm site doctor` is clean. `pnpm env:check` passes with the production values.
- [ ] Sign up on the live site. The verification email arrives from your domain.
- [ ] Add a tool and paste the snippet into a test page; the tool shows **Live**.
- [ ] Buy Anchor in Dodo test mode; the plan appears and handshakes unlock.

## Fallbacks
Netlify's Next.js 16 adapter is still rolling out. `proxy.ts` (sign-in protection) is bundled
as an edge function on Netlify. A local Netlify build here passed everything except that final
bundling step, which downloads Deno and was blocked by this sandbox's network. If a real
deploy fails at "Edge Functions bundling", switch hosts. Nothing else in the stack changes:
- **Vercel Pro** ($20/mo): import the repo. `vercel.json` is already set up.
- **Hetzner CX22 + Coolify** (≈ €4.49/mo): `pnpm site add docker` adds a Dockerfile and a
  compose file with Postgres, so you can also drop Neon.
