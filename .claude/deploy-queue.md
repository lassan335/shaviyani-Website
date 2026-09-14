# Deployment Queue
_Managed by PM Agent. Deployment Agent (release-engineer) reads this file for instructions._

updated_at: 2026-09-14 15:59

---

## ⚠️ No production target configured

There is no hosting platform, managed database, git remote, or payment gateway wired up for this
project yet (see `.claude/agents/release-engineer.md` and `docs/DEPLOY.md`). Every entry queued here
today can only go through a **local preflight** (build/lint clean, schema in sync via
`npx prisma db push`) — there is nothing to actually deploy to.

When a host is chosen (e.g. Vercel) and a database is chosen (e.g. Supabase/Postgres), replace this
section with the real verification mandate (build-ready check via the host's API/MCP, post-deploy smoke
checks) before treating any queued task as deployable to a live URL.

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
