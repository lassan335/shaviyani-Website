# Deploy Runbook — Shaviyani Pro

_Maintained by the `release-engineer` agent. Read first, write back last, every run._

Last updated: 2026-09-14 (local project setup — no production exists yet)

## Current state: local-only, pre-launch

There is no hosting platform, no managed database, no git remote, and no payment gateway configured.
This file exists so that when any of those are added, there's a single place to record it. Until then,
"deploy" means: build succeeds locally (`npm run build`) and the local SQLite schema is in sync
(`npx prisma db push`).

## Stack

- **Framework:** Next.js 14 (App Router), React 18.
- **Data layer:** Prisma 5 ORM, SQLite locally (`prisma/dev.db`, path from `DATABASE_URL` in `.env`,
  both gitignored). Schema: `prisma/schema.prisma`. No migration history yet — schema changes are applied
  with `npx prisma db push` (dev-only tool, no migration files). Seed data: `node prisma/seed.js`.
- **Auth:** none. **Payments:** none integrated. See `.claude/agents/finsec-analyst.md` for what that
  means for review scope.

## Commands

| Purpose | Command |
|---|---|
| Install deps | `npm install` |
| Dev server | `npm run dev` |
| Production build | `npm run build` (runs `prisma generate && next build`) |
| Start built app | `npm run start` |
| Sync local DB schema | `npx prisma db push` |
| (Re)seed local DB | `node prisma/seed.js` |

## Deployment coordinates

- **Prod URL:** none.
- **Hosting platform:** none chosen. (Vercel is a natural fit for Next.js, per the original project plan
  — not yet set up.)
- **Database:** none chosen for production. (Supabase/Postgres, or Railway, per the original project
  plan — not yet set up. Local dev uses SQLite; the Prisma schema uses portable types/`cuid()` ids to
  keep a future move to Postgres low-friction, but `db push` must be replaced with tracked
  `prisma migrate` files before there is any real database to protect.)
- **Git remote:** none — local `main` branch only, no `origin`.
- **Payment gateway:** none — checkout collects order details only, no charge is made. The UI text says
  "payment collected on delivery / by bank transfer" as a placeholder.

## Credential inventory

None exist yet. `DATABASE_URL` in `.env` points at a local file path only (not a secret). When a real
host/DB/payment gateway are added, list each credential's **name and location** here (never its value).

## Migration pipeline

Not applicable yet — no migration history, no prod DB. Before the first real deploy: switch from
`prisma db push` to `prisma migrate dev` (to generate tracked migration files) and `prisma migrate deploy`
(to apply them to prod), per standard Prisma practice.

## Gotchas

- SQLite is a single file and can lock under concurrent access — stop the dev server before running
  `db push`/seed scripts if you hit a "database is locked" error.
- `app/admin` has no authentication (see `.claude/agents/finsec-analyst.md`) — do not link to it
  publicly or treat it as safe to expose once this ships anywhere reachable.

## Prod-state snapshot

N/A — nothing deployed.
