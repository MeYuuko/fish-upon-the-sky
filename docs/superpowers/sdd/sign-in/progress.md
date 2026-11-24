# SDD ledger — plan: docs/superpowers/plans/2026-11-22-sign-in.md

## Setup
- Project root has no `.git` directory; `git rev-parse` and `git status` confirmed this. Therefore prescribed Git worktrees, commit ranges, and helper scripts cannot run here.
- Ruling: execute the user-approved subagent workflow in the current workspace, preserving pre-task snapshots and generating focused unified-diff review packages from those snapshots. This avoids creating unrequested Git metadata; cost if wrong: the normal commit-based recovery path is unavailable, mitigated by snapshots and task review packages.
- Browser source docs consulted: official Clerk React quickstart uses `@clerk/react` and `ClerkProvider`; no CLI init, account creation, or key handling will be performed without owner configuration.
- Logo steering: don't use the two attached reference images as page artwork; use `Logo/Logo.svg` (the user's web export of `Logo/Logo.af`) and keep the `.af` source untouched.

## Preflight conflict scan
| Pair/task | Shared file or interface | Producer → consumer | Scan / ruling |
|---|---|---|---|
| Task 1 → Task 3 | `auth-config.js`, package SDK | Task 1 exports key/config and installs SDK; Task 3 consumes them | Agrees; Task 3 must use current official `@clerk/react` React APIs. |
| Task 2 → Task 3 | `AuthEntry.jsx`, `styles.css`, callbacks | Task 2 creates entry states/callbacks; Task 3 injects Clerk actions and gates app | Agrees; retain the Task 2 public callback contract unless provider API needs a scoped presentation adjustment. |
| Task 3 → Task 4 | auth files, app, styles, env docs | Task 3 implements; Task 4 reviews security boundary and integrated UI | Agrees; no real accounts/config or group persistence created. |
| Task 1 | package/config/.gitignore/env example | Adds only public-key config and safe client package | Internally consistent; build without env key must still work. |
| Task 2 | auth entry and styles | Adds sign-in, recovery, demo states | Internally consistent; reference photos stay reference-only, logo is the only provided artwork. |
| Task 3 | Clerk root, app, auth entry, styles | Maps provider user to canonical member and gates planner | Internally consistent with spec; missing provider config must remain demo-only. |
| Task 4 | review-only files | Final integrated check | Internally consistent; build/manual UI only, no automated tests. |

- Task 1: complete (snapshot review clean; no Git history available).

- Task 2 integration note: the current Home screen already contains a ‘My tasks’ section; after sign-in, open the existing Home screen instead of inventing a separate task feature.

- Task 2: minor (deferred): reset-success status announcement may be missed across keyed screens; re-evaluate in final review. Fix round 1 base snapshot captured in aseline/task-2-fix1.

- Task 2: fix round 1/5 (2 addressed, 0 open — validation error announcement/focus; rejected-action retry focus). Re-review approved; no new breakage.
- Task 2: complete (snapshot review clean; one Minor deferred to final review).
- Ruling: pass canonical members and a enderPlanner callback into ClerkAuthRoot — this avoids duplicated member IDs and an App/AuthRoot import cycle; cost if wrong: extra prop surface, limited to the planned integration boundary.

- Task 3: minor (deferred): demo exit remount focus and provider-level recovery enumeration behavior need final/configured-instance review.
- Task 3 fix round 1 base snapshot captured in aseline/task-3-fix1.
