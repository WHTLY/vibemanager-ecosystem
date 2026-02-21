# AGENTS.md Template

This file is created at the project root during bootstrap. Copy it verbatim, replacing
`{PROJECT_NAME}` with the actual project name.

---

```markdown
# AGENTS.md — {PROJECT_NAME}

## Mandatory Protocol for ALL AI Agents

This project uses **VibeAgent Governance** — a living documentation and project management system.
Every AI agent working on this project MUST follow this protocol. No exceptions.

The canonical source of truth lives in the `VibeAgent/` directory.

## Lite Mode Bypass

If the user's prompt contains `#lite` or `#quick`, **SKIP** the Session Start and Close protocols. You may proceed to make the minor request, check it locally, and reply.

If the user's prompt contains `#cleanup` or `#garbage-collection`, the session's goal is explicitly **Technical Debt Resolution**. Refer to `VibeAgent/ARCHITECTURE.md` (Golden Principles) and perform refactoring and `Doc Gardening` without focusing on feature requests. Normal close protocols apply.

## Session Start (REQUIRED for full sessions)

Before doing ANY work, read these files:

1. `VibeAgent/STATUS.md` — current health, blockers, recent progress
2. `VibeAgent/ROADMAP.md` — current objectives and priorities
3. `VibeAgent/tasks/` — scan open task files (e.g., `TASK_...md`)

If your intended work differs from `VibeAgent/ROADMAP.md`, update it with rationale before proceeding.

## During Work (REQUIRED)

- Pick a task from `VibeAgent/tasks/` and change its frontmatter `status` to `in_progress`.
- Update your task file incrementally as you work (blockers, Definition of Done). Do NOT batch updates for the end of the session.
- Architecture claims require evidence: cite code paths (`path/to/file:line`).
- If code contradicts documentation: code wins, mark doc as `stale`.
- **Quarantine Rule**: Never randomly delete old files (especially when onboarding). Move them to `VibeAgent/quarantine/` and record them in `REGISTRY.md`.

## Session Close (REQUIRED for full sessions)

Before ending your session:

1. Update your task file in `VibeAgent/tasks/` — (change status to `done`, DoD checked).
2. Update `VibeAgent/STATUS.md` — health, blockers, progress.
3. Update `VibeAgent/ROADMAP.md` — if epics or objectives changed/finished.
4. Create session note: `VibeAgent/sessions/YYYY-MM-DD_{AGENT}_{short_slug}.md`.
5. **Session Archiving**: If `sessions/` has >10 files, you MUST compress the 5 oldest into one file under `sessions/archive/WEEK_X_SUMMARY.md` and delete the originals.
6. Run: `node VibeAgent/_tools/validate.js`. **DO NOT REPLY to the user until this validation passes.**

## Key Rules

- **SSOT**: One source of truth per domain. See `VibeAgent/KNOWLEDGE.md` for the registry.
- **Evidence**: No claim without code pointer. No evidence = Assumption.
- **ID format**: `TASK_{DATE}_{ID}_{slug}.md`, `RES_...`, `PROMPT_...`, `SUBSYS_...`, `COMP_...`

## Commands

```bash
# Validate canon integrity
node VibeAgent/_tools/validate.js

# Enforce session close
node VibeAgent/_tools/close-session.js
```
```
