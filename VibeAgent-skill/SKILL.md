---
name: VibeAgent
description: >
  VibeAgent — living project governance system. Bootstraps and maintains a VibeAgent/ directory
  with structured canon: tasks, architecture, status, risks, and session protocol.
  Use when: bootstrap, starting or closing a session, updating status/roadmap/tasks, or validating canon.
  Trigger terms: bootstrap, VibeAgent/, STATUS.md, ROADMAP.md, session start, session close, canon, governance, AGENTS.md, validate.js.
  Proactive: at session start in a project with VibeAgent/, read STATUS.md and ROADMAP.md first.
  Supports #lite or #quick to bypass Session Start/Close; #cleanup or #garbage-collection for technical debt pass.
---

# VibeAgent Governance

**References:** bootstrap-templates, agents-md-template, migration-playbook, schemas, validate-js, bootstrap.sh.

## Overview

This skill deploys and maintains a **living governance system** for a software project. The system
is centered around a `VibeAgent/` directory that serves as the single source of truth (SSOT) for project
status, architecture, tasks, risks, and decisions. It is tool-agnostic.

The canon is a **living organism** that agents are obligated to read at session start and update throughout their work.

## Core Execution Standards

- **Plan first for non-trivial work**: If the task has 3+ steps, touches architecture, spans multiple files, or the root cause is unclear, write a checkable plan in the active task before editing code.
- **Re-plan when reality changes**: If the original plan is invalidated by new evidence, stop and update the task/spec before continuing.
- **Verify before done**: Never mark a task complete without localized proof: tests, build, logs, smoke checks, or other concrete evidence recorded in the task file.
- **Capture lessons after corrections**: If the user corrects the agent or a repeated failure pattern appears, update `VibeAgent/LESSONS.md` with the mistake pattern and prevention rule.
- **Parallelize when the agent can**: If the platform supports subagents or parallel workers, use `STREAMS.md` as the orchestration map. If not, use the same decomposition manually.

## Workflow Decision Tree

```
User says "bootstrap" / new project without VibeAgent/
  → Go to: Bootstrap

Project already has VibeAgent/ and session is starting
  → Go to: Session Start Protocol

Project has any existing harness / canon / governance docs
  → Go to: Migration Intake & Questionnaire

Task is non-trivial (3+ steps / architecture / unclear root cause)
  → Go to: Planning & Orchestration

User reports a bug / regression / failing check
  → Go to: Bugfix Flow

User prompt contains "#lite" or "#quick"
  → Go to: Lite Mode (skip Session Start/Close overhead)

User is working on tasks / making changes
  → Go to: In-Session Discipline

User is done working / closing session
  → Go to: Session Close Protocol

User asks to validate / check canon health
  → Go to: Validation

User prompt contains "#cleanup" or "#garbage-collection"
  → Go to: Explicit Garbage Collection
```

## 1. Bootstrap

When initializing governance for a new project, create the full structure.
Read `references/bootstrap-templates.md` for the complete file templates.

**Two paths:**
- **One-click:** Run the installer (from the ecosystem repo). It fetches and runs `auto-bootstrap.js`, which creates VibeAgent/ dirs, all template files from bootstrap-templates, AGENTS.md (with placeholders), _tools/ (validate.js, close-session.js from references/validate-js.md), and _schemas/ (from references/schemas.md). Production URL: see project README (e.g. `curl -sSL .../VibeAgent-skill/scripts/install.sh | bash -s "Project Name" "PROJ-ID" "Department"`).
- **Manual:** Run `scripts/bootstrap.sh` to create VibeAgent/ dirs only. Then generate file content from `references/bootstrap-templates.md` and `references/agents-md-template.md` (extract inner markdown, replace placeholders). Manual bootstrap does not create _schemas/ or _tools/ unless the agent also deploys them (e.g. fetch schemas.md and validate-js.md, extract and write).

**Handling Existing Projects (Quarantine First):** If bootstrapping into a project that already has unstructured task lists (e.g., TODO.txt, old markdown plans), parse those docs into the new `VibeAgent/tasks/` format and move the old legacy files to `VibeAgent/quarantine/`. Do not leave unstructured legacy task files floating around.

**Migration-aware bootstrap:** If the repo already has any harness, canon, prompt pack, agent rules, or governance docs, do not treat this as a greenfield bootstrap. Read `references/migration-playbook.md`, run a migration audit first, and present the questionnaire to the user before overwriting or quarantining anything.

### Directory Structure

```
project-root/
├── AGENTS.md                          ← Agent protocol (tool-agnostic)
└── VibeAgent/
    ├── README.md                      ← Entry point, explains the system
    ├── INSTRUCTIONS.md                ← Session protocol + canon discipline
    ├── KNOWLEDGE.md                   ← Single Source of Truth registry + core business logic
    ├── STATUS.md                      ← Health, blockers, progress
    ├── ROADMAP.md                     ← Immediate objectives, stage plans, completed work
    ├── GLOSSARY.md                    ← Glossary of project entities
    ├── ARCHITECTURE.md                ← Architecture overview with evidence rules
    ├── PRODUCT_CONTRACT.md            ← Product contract
    ├── STREAMS.md                     ← Parallel work streams for agents
    ├── RISKS.md                       ← Known risks + mitigations
    ├── LESSONS.md                     ← Corrections, recurring mistakes, prevention rules
    ├── METADATA.yaml                  ← Project metadata (name, ID, department)
    ├── MAP.yaml                       ← Architecture map (subsystems, components, flows)
    ├── COMMANDS.yaml                  ← Command center
    ├── tasks/                         ← Task backlog (Individual Markdown files with YAML frontmatter)
    │   └── TASK_YYYY_MM_DD_NNNN_slug.md  ← Task file template
    ├── specs/                         ← Feature specifications
    │   └── mvp/                       ← MVP-scoped specs
    ├── decisions/                     ← Architecture Decision Records (ADRs)
    │   └── 0001-template.md           ← ADR template
    ├── sessions/                      ← Session notes
    │   └── archive/                   ← Compressed timeline summaries of older sessions
    ├── research/                      ← Research artifacts
    │   ├── README.md
    │   └── INDEX.yaml
    ├── userprompts/                   ← Prompt library
    │   ├── README.md
    │   └── INDEX.yaml
    ├── quarantine/                    ← Quarantined artifacts
    │   └── REGISTRY.md
    ├── _tools/                        ← Governance tooling
    │   ├── validate.js                ← Canon validator
    │   └── close-session.js           ← Session close enforcer
    └── _schemas/                      ← JSON schemas for YAML validation
        ├── metadata.schema.json
        ├── map.schema.json
        ├── commands.schema.json
        ├── prompts.schema.json
        └── research.schema.json
```

### Bootstrap Steps

1. Create the `VibeAgent/` directory and all subdirectories
2. If an existing harness/canon is present, follow Migration Intake & Questionnaire before continuing
3. Generate all template files from `references/bootstrap-templates.md`
4. Create `AGENTS.md` in the project root (see `references/agents-md-template.md`)
5. Customize `METADATA.yaml` with the project ID, project name, department, and current date
6. Recommend or automatically set up Git pre-commit hooks to run `validate.js`
7. Run validation: `node VibeAgent/_tools/validate.js`

### AGENTS.md — Universal Agent Protocol (The Map over Manual)

The `AGENTS.md` file lives at the project root. It is the **enforcement mechanism** that ensures
every AI agent follows the canon protocol. Read `references/agents-md-template.md`.

*Harness Engineering Principle (Context Delivery):* `AGENTS.md` should be treated as a "table of contents" (a map), not an encyclopedia (a manual). Keep it short (~100 lines) and use it strictly to point agents to deeper sources of truth like `KNOWLEDGE.md` or `ARCHITECTURE.md`.

- **Session start**: Read `VibeAgent/STATUS.md` and `VibeAgent/ROADMAP.md`
- **During work**: Update tasks in `VibeAgent/tasks/` incrementally
- **Session close**: Update STATUS, ROADMAP, create session note
- **Evidence rule**: Claims require code pointers (`path:line`)
- **Doc Gardening**: Update documentation (like `KNOWLEDGE.md`) if it is found to be stale compared to the actual codebase behavior.

## 2. Migration Intake & Questionnaire

Use this flow when the project already contains any governance system, including older VibeAgent repos, `AGENTS.md`, `.cursorrules`, `CLAUDE.md`, prompt packs, roadmap docs, task lists, runbooks, or internal canon folders.

### Migration Goals
- Preserve signal, not file layout.
- Import useful legacy artifacts into the right VibeAgent destinations instead of blindly copying everything.
- Quarantine superseded artifacts with a paper trail.
- Make the user aware of what will change before edits begin.

### Migration Audit
- Inspect the repo for existing harness/canon artifacts before writing VibeAgent files.
- Prefer using the bundled migration audit script when available.
- Classify findings into: active tasks, roadmaps/plans, prompts, commands/runbooks, research/architecture notes, session history, rules/guardrails, and obsolete noise.

### Pre-Migration Questionnaire
Before migrating, summarize findings and ask the user these questions in plain language:

1. Should VibeAgent replace the current harness immediately, run in shadow mode for a while, or be introduced in phases?
2. Which existing artifacts are still authoritative and must be preserved as active sources of truth during migration?
3. Which legacy categories should be imported as extras: prompts, commands, lessons/rules, research notes, architecture docs, session history, open tasks?
4. Should legacy files be quarantined immediately after import, or kept in place until the new canon is validated?
5. Are there any files or directories the agent must not move, rewrite, or absorb automatically?

If the user is unavailable, choose the safest assumption: shadow mode + quarantine-first + no deletion.

### Importing Useful Extras
- Do not stop at “main canon migrated.” If the old harness contains useful patterns, re-home them deliberately:
  - rules/guardrails → `AGENTS.md`, `INSTRUCTIONS.md`, `KNOWLEDGE.md`, or `LESSONS.md`
  - prompts/macros → `userprompts/`
  - command recipes → `COMMANDS.yaml`
  - architecture and research notes → `ARCHITECTURE.md`, `MAP.yaml`, `research/`
  - active TODO/roadmap items → `tasks/` and `ROADMAP.md`
  - reusable checklists → task templates, `INSTRUCTIONS.md`, or `close-session.js` workflow

### Quarantine & Traceability
- Move superseded artifacts to `VibeAgent/quarantine/` instead of deleting them.
- Record the source path, reason, and new destination in `quarantine/REGISTRY.md`.
- If a useful legacy idea is implemented as an extra rather than copied verbatim, note that in the registry entry.

## 3. Session Start Protocol

At the beginning of every work session (unless `#lite` flag is present):

1. **Read** `VibeAgent/STATUS.md` — understand project health, blockers, recent progress
2. **Read** `VibeAgent/ROADMAP.md` — understand current objectives and priorities
3. **Check** `VibeAgent/tasks/` — scan open task files to verify status matches reality
4. **If the work is non-trivial**, create or update a task plan with checkable items. If ambiguity is high, add or update a spec in `VibeAgent/specs/`.
5. **If your intended work differs from ROADMAP.md**:
   - Update `VibeAgent/ROADMAP.md` with rationale for the change, OR
   - Create a new task in `VibeAgent/tasks/` using `TASK_{DATE}_{ID}_{slug}.md` naming convention

## 4. Planning & Orchestration

### Plan-First Rule
- Treat any 3+ step task, architectural decision, broad refactor, or unclear bug as **non-trivial**.
- Write a plan in the active task under `## Plan` using checkable items.
- If the work changes system behavior or introduces important tradeoffs, create or update a spec/ADR before implementation.

### Re-Planning Rule
- If verification, code inspection, or user feedback invalidates the current plan, stop and rewrite the plan before continuing.
- Do not keep pushing through a broken plan just because implementation already started.

### Parallel Research / Subagents
- If the agent platform supports subagents or parallel workers, offload research, exploration, or isolated analysis tacks to them.
- Keep one tack per subagent and merge only after localized verification.
- If the platform does not support delegation, use the same decomposition via `STREAMS.md` and execute serially.

### Bugfix Flow
- Start from evidence: failing test, error log, reproduction steps, or concrete user report.
- Fix the root cause with minimal impact; avoid speculative or cosmetic patches.
- After the fix, verify the failing behavior changed in the intended direction and record the evidence in the task.

## 5. In-Session Discipline

### Task Updates (tasks/)
- Use `TASK_{DATE}_{ID}_{slug}.md` format for task files.
- Change task status immediately in the YAML frontmatter when starting work: `planned` → `in_progress`
- Update the `## Plan` checklist and Definition of Done incrementally as work progresses.
- Add blockers as they emerge to the task body and `STATUS.md`.
- After user corrections or repeated mistakes, append a concise entry to `VibeAgent/LESSONS.md`.

### Health Rules
The `VibeAgent/STATUS.md` must have strictly one of the following health indicators in the `## Health` section: `GREEN`, `YELLOW`, `RED`.

### Quarantine-First Cleanup
- Move files to `VibeAgent/quarantine/` first, then add restoration context to `quarantine/REGISTRY.md`. Do not simply `rm -f` without reason.

### Verification Before Done
- Never mark a task `done` without filling its `## Verification` section.
- Prefer the narrowest meaningful proof: targeted tests, build step, lint, runtime logs, or smoke checks.
- When relevant, compare pre-fix and post-fix behavior rather than only reporting that a command passed.

### Elegance & Scope
- Prefer the simplest solution that fixes the root cause.
- For non-trivial changes, pause once and ask whether there is a cleaner or lower-impact design.
- Do not let “elegance” become an excuse for unnecessary refactors.

## 6. Session Close Protocol

Before ending a full session, promote all work into canon:

1. **Update `VibeAgent/tasks/`** — mark tasks done, update dependencies, DoD, create follow-ups
2. **Update `VibeAgent/LESSONS.md`** — if new correction patterns or reusable lessons emerged
3. **Update `VibeAgent/STATUS.md`** — health, blockers, progress summary
4. **Update `VibeAgent/ROADMAP.md`** — if objectives changed or were completed
5. **Create session note**: `VibeAgent/sessions/YYYY-MM-DD_{AGENT}_{objective_slug}.md`
6. **Session Archiving check**: If `VibeAgent/sessions/` has more than 10 files, select the 5 oldest files, compress them into `VibeAgent/sessions/archive/WEEK_{X}_{SUMMARY}.md`, and delete the originals.
7. **Run validation**: `node VibeAgent/_tools/validate.js`. **You must pass validation before replying to the user.**

## 7. Lite Mode

If the user prompt contains `#lite` or `#quick`, bypass Session Start, Session Close, and Session Note creation. 
Simply implement the fix, run localized checks, and reply. If the user corrected the agent or exposed a repeatable mistake pattern, still update `VibeAgent/LESSONS.md`.

## 8. Explicit Garbage Collection / Cleanup

If the user prompt contains `#cleanup` or `#garbage-collection`:
1. Read `VibeAgent/ARCHITECTURE.md` (specifically the Golden Principles) and `VibeAgent/RISKS.md`.
2. Do not focus on feature work. Spend the session purely on system coherence: scan the codebase for technical debt, inconsistencies, out-of-date configurations, or unhandled errors.
3. Bring the codebase back into alignment with the project's invariants.
4. Refactor and verify the changes locally before completing the assignment. Update documentations (`Doc Gardening`) accordingly.

## 9. Validation & Agent-Legible Observability

The canon validator (`VibeAgent/_tools/validate.js`) checks:
- All required files exist
- Standard YAML files conform to JSON schemas in `_schemas/`
- All task files in `tasks/` have valid YAML frontmatter matching required enums
- Task structure is complete enough to support planning and verification
- Strict health formats in STATUS.md

*Harness Engineering Principle (Observability):* Any validation error outputted by these scripts should be explicitly "Agent-Legible". It must contain specific remediation instructions tailored to an LLM on exactly how to fix the error in the repository.

**Example of an Agent-Legible Error Log:**
```
ERROR: VibeAgent/METADATA.yaml is invalid. Missing required property 'owner'.
REMEDIATION FOR AI AGENT:
1. Open VibeAgent/METADATA.yaml.
2. Add the 'owner' field at the root level.
3. The value must be an email address (e.g., owner: admin@example.com).
4. If you don't know the owner, check VibeAgent/README.md or ask the user.
```

Run: `node VibeAgent/_tools/validate.js`

Exit codes: `0` (valid), `2` (failed), `3` (error)

**Troubleshooting:** Validation fails (missing file, bad health) — follow the REMEDIATION FOR AI AGENT output. Missing file: create from `references/bootstrap-templates.md` (matching section) or re-run bootstrap.

## 10. Examples

- User: "Bootstrap this repo" / "Set up VibeAgent" — Run or recommend one-click install; create VibeAgent/ from references/bootstrap-templates.md and AGENTS.md from agents-md-template; run validate.js.
- User: "Migrate our existing AI harness" / "Adopt VibeAgent without losing our current workflow" — audit the current harness first, present the migration questionnaire, import useful extras into canonical destinations, quarantine superseded artifacts, then validate.
- User: "What's the status?" / "Any blockers?" — Read VibeAgent/STATUS.md and VibeAgent/ROADMAP.md; summarize health, blockers, next steps.
- User: "Fix this failing test" / "Investigate this bug" — collect evidence first, create or update a task plan if the work is non-trivial, fix the root cause, record verification, then update canon.
- User: "Close my session" — Update tasks, STATUS.md, ROADMAP.md; create session note in VibeAgent/sessions/; run node VibeAgent/_tools/close-session.js (or validate.js); do not reply until validation passes.

## 11. Resources

- `references/bootstrap-templates.md` — Templates for all VibeAgent/ files.
- `references/agents-md-template.md` — AGENTS.md template.
- `references/migration-playbook.md` — Migration audit, questionnaire, and legacy artifact mapping.
- `references/schemas.md` — JSON schema definitions.
- `references/validate-js.md` — validate.js source.
- `scripts/audit-harness.js` — Detect and classify existing governance artifacts before migration.
- `scripts/bootstrap.sh` — Manual bootstrap (dirs only); use with bootstrap-templates for full setup.
- One-click install: `curl -sSL <ecosystem>/VibeAgent-skill/scripts/install.sh | bash -s "Project Name" "PROJ-ID" "Department"` (see README for URL).
