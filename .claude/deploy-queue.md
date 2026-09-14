# Deployment Queue
_Managed by PM Agent. Deployment Agent (release-engineer) reads this file for instructions._

updated_at: 2026-09-15

---

## ⭐ Deployment Agent STANDING MANDATE — verify every deploy

Prod: https://shaviyani-pro.vercel.app (Vercel project `lassan335/shaviyani-pro`). Full coordinates in
`docs/DEPLOY.md` — read it first. Deploys are manual (`vercel --prod --yes`), no GitHub auto-deploy
configured. After deploying:

1. Confirm the CLI's own JSON output shows `"readyState": "READY"` for the new deployment.
2. Smoke-test with `curl` against the prod URL: `/` and one dynamic route (e.g. `/product/<a-real-slug>`)
   should return 200 with real content (not just a shell). `/admin` should return a **307 redirect to
   `/admin/login`** when unauthenticated (that's correct — it's password-gated, not a broken route); a
   200 there without a session cookie would mean the gate broke.
3. If any check fails, do not mark the task DONE — follow the release-engineer's Escalation Protocol.

**Standing gaps to flag on every relevant task, not just once:** No payment gateway is integrated. Local
dev and prod currently share one Supabase database (no staging DB). `/admin` auth is a single shared
password, not per-user accounts — fine for a solo operator, worth upgrading if that changes.

---

## QUEUE

| Position | Task ID | Title | Type | Priority | Queued At | Status | Notes |
|----------|---------|-------|------|----------|-----------|--------|-------|

---

## IN PROGRESS

| Task ID | Title | Started | ETA | Agent Slot |
|---------|-------|---------|-----|------------|

---

## DEPLOYED (last 10)

| Task ID | Title | Deployed At | Deployed By | Commit/Tag |
|---------|-------|-------------|-------------|------------|

---

## FAILED

| Task ID | Title | Failed At | Reason | Retry? |
|---------|-------|-----------|--------|--------|
