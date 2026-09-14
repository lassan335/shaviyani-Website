# Deployment Queue
_Managed by PM Agent. Deployment Agent (release-engineer) reads this file for instructions._

updated_at: 2026-09-15

---

## ⭐ Deployment Agent STANDING MANDATE — verify every deploy

Prod: https://shaviyani-pro.vercel.app (Vercel project `lassan335/shaviyani-pro`). Full coordinates in
`docs/DEPLOY.md` — read it first. Deploys are manual (`vercel --prod --yes`), no GitHub auto-deploy
configured. After deploying:

1. Confirm the CLI's own JSON output shows `"readyState": "READY"` for the new deployment.
2. Smoke-test with `curl` against the prod URL: at minimum `/`, `/admin`, and one dynamic route (e.g.
   `/product/<a-real-slug>`) should return 200 with real content (not just a shell).
3. If either check fails, do not mark the task DONE — follow the release-engineer's Escalation Protocol.

**Standing gaps to flag on every relevant task, not just once:** `/admin` has no authentication and is
now publicly reachable at the prod URL — anything touching it is higher priority than routine. No
payment gateway is integrated. Local dev and prod currently share one Supabase database (no staging DB).

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
