# TODO

Keep this file in English.

## P0

- [ ] Fix local sync for `repo.path`
  `VibeManager-app/repositories.json` uses `./dummy-project-1`, but `VibeManager-app/src/sync.js` resolves local paths relative to `process.cwd()` (`VibeManager-app`). As a result, `npm run sync` does not find the demo project. Normalize `repo.path` relative to the config file or repo root, or update the sample config and README so onboarding works out of the box.

- [ ] Make frontend lint independent from `dist`
  After `npm run build`, `npm run lint` in `VibeManager-app/frontend` fails on generated bundle output because `eslint .` picks up `dist`. Exclude build artifacts explicitly or narrow lint scope to source files.

- [ ] Remove side effects from the aggregate test
  `VibeManager-app/test/aggregate.test.js` runs the real `src/aggregate.js`, which rewrites tracked fixture outputs with a fresh `lastUpdated`. A plain test run dirties the worktree. Make the test deterministic by using fixed time, a temp fixture copy, or assertions that do not overwrite tracked files.

## P1

- [ ] Add a backfill path for already-bootstrapped VibeAgent repos
  The migration/bootstrap flow is now safe-by-default and explicit, but older VibeAgent repos may still miss newer canon expectations such as `project.migration_mode`, `required_for_done`, `LESSONS.md`, or stronger task structure. Add a low-friction upgrade path for these repos.

## Completed: VibeAgent Skill Hardening

### Findings

- `VibeAgent-skill` promised a stricter session protocol than `validate.js` and `close-session.js` actually enforced.
- Session protocol details were duplicated across `SKILL.md`, `agents-md-template.md`, and `bootstrap-templates.md`, which created drift risk.
- Planning and verification rules for non-trivial work were not enforced strongly enough.

### Review

- [x] Simplified and clarified `VibeAgent-skill/SKILL.md` as the router and orchestration policy.
- [x] Updated `agents-md-template.md` and `bootstrap-templates.md` for planning, verification, lessons, and bugfix flow.
- [x] Tightened `validate.js` and `close-session.js` so the protocol is closer to actual enforcement.
- [x] Verified cross-file consistency and recorded follow-up ideas and residual risks.

### Notes

- Keep planning inside task files or specs; do not introduce `tasks/todo.md`.
- Keep lessons in `VibeAgent/LESSONS.md`, not under `tasks/`.
- If the agent platform supports subagents, use `STREAMS.md` as the orchestration map; otherwise use the same decomposition manually.

## Completed: Migration Workflow

### Findings

- The original skill described quarantine-first onboarding, but not a full migration flow for arbitrary existing harnesses/canons.
- Migration needed a user-visible questionnaire before replacing or absorbing legacy governance.
- Useful legacy artifacts needed deliberate re-homing, not just quarantine.

### Review

- [x] Added migration intake and questionnaire flow to `VibeAgent-skill/SKILL.md`.
- [x] Added a migration playbook with legacy artifact mapping to canonical VibeAgent destinations.
- [x] Added `audit-harness.js` to classify existing governance surface before migration.
- [x] Documented migration-aware behavior in bootstrap tooling.

### Notes

- Prefer reusing canonical destinations plus `quarantine/REGISTRY.md` over inventing a default `MIGRATION.md`.
- Good migration defaults remain: `shadow` mode, quarantine-first, and no deletion without explicit user awareness.

## Completed: Harness Engineering Alignment

### Findings

- The repo is intentionally narrow: `VibeAgent-skill` should improve governance and execution through the existing canon, and `VibeManager-app` should remain a thin portfolio observer.
- Adding new mandatory canon files or synthetic readiness scoring would increase entropy without proportional operational value.
- The best harness-engineering gains here come from safer migration, command-backed verification, and a minimal harness signal in aggregation.

### Review

- [x] Made migration bootstrap safe-by-default: legacy harness detection now blocks writes until explicit migration flags are provided.
- [x] Added minimal schema and tooling extensions: `project.migration_mode` in metadata and `required_for_done` on commands.
- [x] Taught `close-session.js` to run required verification commands after structural validation.
- [x] Added a minimal harness signal to aggregate/UI without readiness scores or extra canonical documents.
- [x] Ran targeted verification and recorded the remaining follow-up.

### Notes

- Do not add mandatory `RUNBOOK.md`, `REFERENCE_EXAMPLES.md`, `LOCAL_CONTEXT.md`, or a default `MIGRATION.md` unless there is a concrete operational need.
- If bootstrap cannot confidently infer verification commands, record them as reference entries without `required_for_done` rather than guessing.
- Prefer explicit reruns with flags over an interactive wizard inside `curl | bash`.
