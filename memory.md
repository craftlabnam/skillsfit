# Memory — SkillsFit Build

Last updated: 2026-09-08

## What was built

This session restored prior context (via /remember restore) and completed Feature 04 — Database Schema entirely through InsForge MCP infrastructure tools (no application code changes):

- Created `profiles`, `agent_runs`, `jobs`, `agent_logs` tables in the InsForge Postgres backend via `run-raw-sql`, matching every column in `context/architecture.md`.
- Enabled RLS on all four tables with one `FOR ALL` ownership policy each (`profiles` keyed on `id`, the other three on `user_id`, via `auth.uid()`), plus the matching `GRANT SELECT/INSERT/UPDATE/DELETE ... TO authenticated`.
- Added indexes on every FK column and CHECK constraints on the columns `architecture.md`'s Notes column documents as fixed enums (`experience_level`, `remote_preference`, `cover_letter_tone`, `work_authorization`, `agent_runs.status`, `agent_logs.level`) plus the one it calls an explicit invariant (`jobs.source IN ('search','url')`) and a `match_score BETWEEN 0 AND 100` range check.
- Created a private `resumes` storage bucket (`isPublic: false`) via `create-bucket`.
- Verified everything live with `get-table-schema` (all four: correct columns/FKs/indexes, `rlsEnabled: true`, exactly one policy each) and `get-backend-metadata` (tables listed with `recordCount: 0`, bucket listed with `public: false`).
- Updated `context/progress-tracker.md` — Phase 1 — Foundation (01–04) is now fully complete; "Current Status" now points to Phase 2, next feature 05.

## Decisions made

- Discovered — not previously documented anywhere in the context files — that this InsForge backend is Supabase-shaped under the hood: `auth.uid()`/`auth.role()`/`auth.jwt()`/`auth.email()` RLS helper functions exist, along with `anon`/`authenticated`/`postgres` roles, and the real user table is `auth.users` (not a bare `users` table). Used this convention directly for every RLS policy rather than inventing a different access-control mechanism. Worth knowing for any future raw-SQL work against this backend.
- `resumes` bucket access control relies on the bucket's private flag (`isPublic: false`) plus the existing app-level `{user_id}/resume.pdf` path convention already documented in `library-docs.md` — InsForge's storage SDK docs expose no per-object/owner-based RLS surface (no owner column, no policy mechanism), so there was nothing further to add at the storage layer.
- Added CHECK constraints and indexes beyond what `architecture.md`'s column tables literally spell out in SQL, but scoped strictly to values its Notes column already documents as fixed enums, plus the one column (`jobs.source`) it explicitly calls out as an invariant — not scope creep, just enforcing what was already specified.

## Problems solved

- None — this feature had no known blockers going in. `architecture.md`'s schema tables were accurate as written and needed no corrections (unlike Features 02/03, which both required fixing invented/stale InsForge API patterns in the context files).

## Current state

- All Phase 1 — Foundation features (01–04) are done and verified. Feature 04 confirmed live against the real backend: 4 tables with `rlsEnabled: true`, exactly one policy each, `recordCount: 0`; `resumes` bucket present with `public: false`.
- No application code (Server Actions, forms, storage upload calls) has been written against this schema yet — that starts with Feature 05/06.
- `tsc --noEmit`/`eslint` not re-run this session (no application code changed — schema work was pure infrastructure via MCP tools).

## Next session starts with

1. **Feature 05 — Profile Page — Full UI:** build the complete `/profile` page UI with mock data per `context/build-plan.md`'s spec — completion banner (percentage ring, missing-field tags), resume upload section (drag-and-drop, Select Resume / Generate Resume buttons), Profile Information form with Personal Info / Professional Info / Work Experience (up to 3 roles) / Education / Job Preferences sections, Save Profile button. No save logic yet — that's Feature 06, which wires it to the `profiles` table created this session.

## Open questions

- Whether email/password ever gets a sign-up flow, or account creation stays Google-OAuth-only by design — still undecided (carried over, unchanged this session).
- What real `/profile` onboarding should look like once Feature 06 lands — now that `profiles.is_complete` exists as a real column (created this session), this can be designed concretely once Feature 06 implements the completeness calculation. Previously this was blocked on the column not existing at all.
