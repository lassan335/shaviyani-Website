# Shaviyani Pro — Jersey Storefront

Team jersey / apparel storefront and internal order-pipeline admin for **Shaviyani Pro**, the jersey,
corporate uniform and trophies division of Shaviyani Holdings (Male', Maldives).

## Stack

Next.js 14 (App Router) + React 18, Prisma 5 + SQLite (local dev DB), plain CSS (`app/globals.css`).
No authentication, no payment gateway, no cloud hosting yet — see **Known limitations** below.

## Running locally

```bash
npm install
npx prisma db push     # create the local SQLite schema (prisma/dev.db)
node prisma/seed.js    # seed sample products + orders
npm run dev             # http://localhost:3000
```

Admin dashboard: `/admin`. Storefront home: `/`.

## Site map

- `/`, `/instant-purchase`, `/pre-order`, `/collections`, `/collections/[slug]`, `/product/[slug]`
- `/size-chart`, `/cart`, `/checkout`, `/order-confirmation/[orderNumber]`, `/track`
- `/quote` (team/bulk quotation requests)
- `/policies/shipping`, `/policies/refunds`, `/faq`, `/contact`
- `/admin` (internal order pipeline + quote request inbox)

## Known limitations (by design, for now)

- **No authentication anywhere**, including `/admin` — it is reachable by anyone with the URL. Do not
  deploy this publicly until admin auth is added.
- **No payment gateway.** Checkout creates an order record; it does not charge a card. The UI says
  payment is "collected on delivery / by bank transfer" as a placeholder.
- **No customer accounts.** Order tracking works via order-number + email lookup (`/track`) instead.
- **SQLite, not Postgres.** Fine for local development; the Prisma schema is written to make a move to
  Postgres (e.g. Supabase) low-friction when it's time to actually launch.

## `.claude/` — project agents

This repo ships three specialized agents (see `.claude/agents/`) plus a PM/coordinator skill
(`.claude/skills/pm-agent/`):

- **coordinator** — tracks in-flight work across multiple parallel Claude Code sessions via
  `.claude/project-state.md` and `.claude/deploy-queue.md`. Never writes code or deploys itself.
- **finsec-analyst** — security review for money handling, PII, and the (currently missing) admin auth.
  Run it after touching `app/actions.js`, checkout, or `prisma/schema.prisma`.
- **release-engineer** — owns the build/deploy pipeline, per `docs/DEPLOY.md`. Currently local-only
  (no host/DB/remote configured), so its job today is preflight checks, not real deploys.

`shareable-agents/` holds the original generic (un-customized) versions of these, for reuse in other
projects.
