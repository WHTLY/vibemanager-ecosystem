---
name: VibeAgent
description: >
  VibeAgent — living project governance system. Bootstraps and maintains a VibeAgent/ directory
  with structured canon: tasks, architecture, status, risks, and session protocol.
  Use this skill whenever starting a new project, onboarding to an existing project with a VibeAgent/ folder,
  opening or closing a work session, updating project status, managing tasks, or running canon validation.
  Also use proactively at the start of any session in a project that has a VibeAgent/ directory — read STATUS.md and ROADMAP.md first.
  Supports `#lite` or `#quick` keywords in user prompt to bypass heavy governance protocols for minor changes.
  Supports `#cleanup` or `#garbage-collection` keywords to run an explicit technical debt cleanup pass.
---

# VibeAgent Governance

## Overview

This skill deploys and maintains a **living governance system** for a software project. The system
is centered around a `VibeAgent/` directory that serves as the single source of truth (SSOT) for project
status, architecture, tasks, risks, and decisions. It is tool-agnostic.

The canon is a **living organism** that agents are obligated to read at session start and update throughout their work.

## Workflow Decision Tree

```
User says "bootstrap" / new project without VibeAgent/
  → Go to: Bootstrap

Project already has VibeAgent/ and session is starting
  → Go to: Session Start Protocol

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

**Handling Existing Projects (Quarantine First):** If bootstrapping into a project that already has unstructured task lists (e.g., TODO.txt, old markdown plans), parse those docs into the new `VibeAgent/tasks/` format and move the old legacy files to `VibeAgent/quarantine/`. Do not leave unstructured legacy task files floating around.

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
2. Generate all template files from `references/bootstrap-templates.md`
3. Create `AGENTS.md` in the project root (see `references/agents-md-template.md`)
4. Customize `METADATA.yaml` with the project ID, project name, department, and current date
5. Recommend or automatically set up Git pre-commit hooks to run `validate.js`
6. Run validation: `node VibeAgent/_tools/validate.js`

### AGENTS.md — Universal Agent Protocol (The Map over Manual)

The `AGENTS.md` file lives at the project root. It is the **enforcement mechanism** that ensures
every AI agent follows the canon protocol. Read `references/agents-md-template.md`.

*Harness Engineering Principle (Context Delivery):* `AGENTS.md` should be treated as a "table of contents" (a map), not an encyclopedia (a manual). Keep it short (~100 lines) and use it strictly to point agents to deeper sources of truth like `KNOWLEDGE.md` or `ARCHITECTURE.md`.

- **Session start**: Read `VibeAgent/STATUS.md` and `VibeAgent/ROADMAP.md`
- **During work**: Update tasks in `VibeAgent/tasks/` incrementally
- **Session close**: Update STATUS, ROADMAP, create session note
- **Evidence rule**: Claims require code pointers (`path:line`)
- **Doc Gardening**: Update documentation (like `KNOWLEDGE.md`) if it is found to be stale compared to the actual codebase behavior.

## 2. Session Start Protocol

At the beginning of every work session (unless `#lite` flag is present):

1. **Read** `VibeAgent/STATUS.md` — understand project health, blockers, recent progress
2. **Read** `VibeAgent/ROADMAP.md` — understand current objectives and priorities
3. **Check** `VibeAgent/tasks/` — scan open task files to verify status matches reality
4. **If your intended work differs from ROADMAP.md**:
   - Update `VibeAgent/ROADMAP.md` with rationale for the change, OR
   - Create a new task in `VibeAgent/tasks/` using `TASK_{DATE}_{ID}_{slug}.md` naming convention

## 3. In-Session Discipline

### Task Updates (tasks/)
- Use `TASK_{DATE}_{ID}_{slug}.md` format for task files.
- Change task status immediately in the YAML frontmatter when starting work: `planned` → `in_progress`
- Update Definition of Done checkbox items as they're completed.
- Add blockers as they emerge to the task body and `STATUS.md`.

### Health Rules
The `VibeAgent/STATUS.md` must have strictly one of the following health indicators in the `## Health` section: `GREEN`, `YELLOW`, `RED`.

### Quarantine-First Cleanup
- Move files to `VibeAgent/quarantine/` first, then add restoration context to `quarantine/REGISTRY.md`. Do not simply `rm -f` without reason.

## 4. Session Close Protocol

Before ending a full session, promote all work into canon:

1. **Update `VibeAgent/tasks/`** — mark tasks done, update dependencies, DoD, create follow-ups
2. **Update `VibeAgent/STATUS.md`** — health, blockers, progress summary
3. **Update `VibeAgent/ROADMAP.md`** — if objectives changed or were completed
4. **Create session note**: `VibeAgent/sessions/YYYY-MM-DD_{AGENT}_{objective_slug}.md`
5. **Session Archiving check**: If `VibeAgent/sessions/` has more than 10 files, select the 5 oldest files, compress them into `VibeAgent/sessions/archive/WEEK_{X}_{SUMMARY}.md`, and delete the originals.
6. **Run validation**: `node VibeAgent/_tools/validate.js`. **You must pass validation before replying to the user.**

## 5. Lite Mode

If the user prompt contains `#lite` or `#quick`, bypass Session Start, Session Close, and Session Note creation. 
Simply implement the fix, run localized checks, and reply.

## 6. Explicit Garbage Collection / Cleanup

If the user prompt contains `#cleanup` or `#garbage-collection`:
1. Read `VibeAgent/ARCHITECTURE.md` (specifically the Golden Principles) and `VibeAgent/RISKS.md`.
2. Do not focus on feature work. Spend the session purely on system coherence: scan the codebase for technical debt, inconsistencies, out-of-date configurations, or unhandled errors.
3. Bring the codebase back into alignment with the project's invariants.
4. Refactor and verify the changes locally before completing the assignment. Update documentations (`Doc Gardening`) accordingly.

## 7. Validation & Agent-Legible Observability

The canon validator (`VibeAgent/_tools/validate.js`) checks:
- All required files exist
- Standard YAML files conform to JSON schemas in `_schemas/`
- All task files in `tasks/` have valid YAML frontmatter matching required enums
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

## 8. Resources

- `references/bootstrap-templates.md` — Templates for all VibeAgent/ files.
- `references/agents-md-template.md` — AGENTS.md template.
- `references/schemas.md` — JSON schema definitions.
- `references/validate-js.md` — validate.js source.
- `scripts/bootstrap.sh` — Automated bootstrap script.
