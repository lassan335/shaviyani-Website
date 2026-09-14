# Deploy Runbook — Shaviyani Pro

_Maintained by the `release-engineer` agent. Read first, write back last, every run._

Last updated: 2026-09-15 — first production deploy complete.

## Current state: live

The site is deployed to Vercel with a Supabase Postgres database. No payment gateway and no admin
authentication yet — see the Hard Gaps section before treating this as launch-ready for real traffic.

## Stack

- **Framework:** Next.js 14 (App Router), React 18.
- **Data layer:** Prisma 5 ORM, Postgres (Supabase) in both local dev and production — they are
  currently **the same database** (see Gotchas). Schema: `prisma/schema.prisma`. No migration history
  yet — schema changes are applied with `npx prisma db push` (dev-only tool, no migration files). Before
  the next schema change, prefer switching to `prisma migrate dev` / `prisma migrate deploy` now that
  there's a real database to protect (see Migration pipeline below).
- **Auth:** none. **Payments:** none integrated. See `.claude/agents/finsec-analyst.md` for what that
  means for review scope.

## Commands

| Purpose | Command |
|---|---|
| Install deps | `npm install` |
| Dev server | `npm run dev` |
| Production build | `npm run build` (runs `prisma generate && next build`) |
| Start built app | `npm run start` |
| Sync DB schema | `npx prisma db push` (stop the dev server first — Windows locks the Prisma engine DLL while it's running) |
| (Re)seed DB | `node prisma/seed.js` |
| Deploy to prod | `npx vercel --prod --yes` (from the project root, already linked) |
| Env vars | `npx vercel env ls` / `env add <NAME> <environment>` / `env rm <NAME> <environment>` |

## Deployment coordinates

- **Prod URL:** https://shaviyani-pro.vercel.app
- **Hosting platform:** Vercel, project `lassan335/shaviyani-pro`. Linked locally via `.vercel/` (gitignored).
  Deploys today are manual (`vercel --prod`) — no GitHub-integration auto-deploy is configured yet, even
  though the code lives on GitHub (see Git remote below). Connecting the two (Vercel dashboard → Project →
  Git) would make every push to `master` auto-deploy; ask before enabling that, since it changes the
  release process from "explicit deploy command" to "every push is live."
- **Database:** Supabase Postgres, project ref `veszopmlmwwfrdiwvrhq`, region `ap-south-1`. The **direct**
  host (`db.<ref>.supabase.co:5432`) is **IPv6-only** and unreachable from this dev machine (confirmed via
  `nslookup` — no A record, only AAAA) — always use the **pooler** host
  (`aws-0-ap-south-1.pooler.supabase.com`) instead:
  - `DATABASE_URL` (runtime/app): pooler, port **6543**, "Transaction" mode, `?pgbouncer=true` appended.
  - `DIRECT_URL` (Prisma migrations): pooler, port **5432**, "Session" mode — supports the prepared
    statements migrations need, and still works over IPv4 unlike the true direct host.
  - Both are set as Vercel env vars (Production + Preview) and in the local `.env` (gitignored). Never
    the true `db.<ref>.supabase.co` host from this machine — it will hang/fail to resolve.
- **Git remote:** `origin` → https://github.com/lassan335/shaviyani-Website.git, branch `master`.
- **Payment gateway:** none — checkout collects order details only, no charge is made. The UI text says
  "payment collected on delivery / by bank transfer" as a placeholder.

## Credential inventory

| Name | Where it lives | Purpose |
|---|---|---|
| `DATABASE_URL` | Vercel env (Production, Preview); local `.env` | Supabase pooler connection, app runtime |
| `DIRECT_URL` | Vercel env (Production, Preview — Production only initially, added to Preview same session); local `.env` | Supabase pooler (session mode), Prisma migrations |
| `NEXTAUTH_SECRET` | Vercel env (Production, Preview) | **Orphaned** — pre-dates this deploy (already present when the Vercel project was first linked, origin unknown/unremembered by the user). The app has no NextAuth integration today; this is unused. Leave it alone (removing it is harmless but pointless) unless real auth gets added, at which point re-evaluate whether to reuse or rotate it. |

Never echo any of these values in output, logs, commits, or chat. Rotate the Supabase DB password (and
update both env locations) if it's ever pasted somewhere outside a private, trusted channel.

## Migration pipeline

Still on `prisma db push` (no tracked migration files) — acceptable for a pre-launch app with no real
customer data yet, but the next schema change should switch to `prisma migrate dev --name <change>`
locally (generates a migration file + applies it) and `prisma migrate deploy` in CI/before a prod deploy
(applies pending migration files). `db push` and `migrate` don't mix cleanly once migration history
exists, so make that switch deliberately, not incrementally.

## Gotchas

- **Local dev and prod share one database.** There is no separate staging/dev database — `npm run dev`
  on this machine reads and writes the same Supabase instance the live site uses. Be careful running
  seed scripts or schema pushes; they affect production data immediately. Standing up a second Supabase
  project (or branch, if using Supabase's branching) for local dev is a reasonable next step before this
  gets real customer orders.
- **Supabase direct host is IPv6-only** from this network — always use the pooler host (see Database
  coordinates above) or `db push`/migrations will hang and fail with `P1001: Can't reach database server`.
- **Windows + Prisma engine file lock:** the dev server holds a lock on the generated Prisma query engine
  `.dll`. Stop `next dev` before `prisma generate` / `db push`, or it fails with `EPERM`.
- **Don't run `next build` while `next dev` is running** — both write to `.next/` and a concurrent build
  corrupts the dev server's cache (manifests as random 500s until the dev server is restarted). Stop dev,
  build, then restart dev.
- `app/admin` has no authentication (see `.claude/agents/finsec-analyst.md`) — it is now live at
  `/admin` on the public prod URL with **zero access control**. Anyone with the URL can see every
  customer's name/email/phone/address and change order status. This is the top-priority follow-up.

## Prod-state snapshot

- Deployed: 2026-09-15, via `vercel --prod --yes`. Build succeeded, deployment `readyState: READY`.
- Smoke-tested routes (all 200, real data confirmed rendering): `/`, `/order`, `/admin`,
  `/collections/trophies-awards`, `/product/champions-shield`. Images (including `next/image`
  optimization) confirmed working in production.
- Database: schema pushed via `prisma db push`, seeded via `node prisma/seed.js` — full catalog (20
  products across 5 collections) and sample orders live in the Supabase production database.
