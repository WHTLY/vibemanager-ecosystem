# Bootstrap Templates

All templates for files created during VibeAgent Canon bootstrap. Replace placeholders:
- `{PROJECT_NAME}` — project name
- `{PROJECT_ID}` — project identifier
- `{DEPARTMENT}` — department
- `{DATE}` — current date in YYYY-MM-DD format
- `{AGENT}` — agent identifier

---

## VibeAgent/README.md

```markdown
# VibeAgent Pack — {PROJECT_NAME}

This directory is the **canonical source of truth** (canon) for project governance.

## Quick Start
1. Read `STATUS.md` for current project health
2. Read `ROADMAP.md` for immediate objectives
3. Validate canon: `node VibeAgent/_tools/validate.js`

## Structure
| File/Directory | Purpose |
|----------------|---------|
| `STATUS.md` | Health, blockers, progress |
| `ROADMAP.md` | Current objectives, epics, + completed history |
| `tasks/` | Canonical backlog. Individual Markdown files with YAML frontmatter |
| `INSTRUCTIONS.md` | Session protocol + canon discipline |
| `KNOWLEDGE.md` | Single Source of Truth registry & core business rules |
| `GLOSSARY.md` | Glossary of project entities |
| `ARCHITECTURE.md` | Architecture overview with evidence rules |
| `PRODUCT_CONTRACT.md` | Product contract |
| `STREAMS.md` | Parallel work streams |
| `RISKS.md` | Known risks + mitigations |
| `METADATA.yaml` | Project metadata |
| `MAP.yaml` | Architecture map |
| `COMMANDS.yaml` | Command center |

## Rules
- Start: Read STATUS + ROADMAP + tasks/
- Work: Update tasks in `tasks/` in real-time
- Close: Update STATUS, ROADMAP, create session note, validate
- Lite Mode: Use `#lite` or `#quick` in your prompt to bypass strict Start/Close session protocols.
```

---

## VibeAgent/INSTRUCTIONS.md

```markdown
# VibeAgent Instructions

This file defines the **Session Protocol** and canon discipline.

## Canon vs Runtime
- `VibeAgent/` is canon and MUST be committed.
- Runtime folders are operational scratchpads.

## Session Start (MUST)
*Skip if `#lite` flag is present in prompt.*
1. Read `VibeAgent/STATUS.md` and `VibeAgent/ROADMAP.md`.
2. Check `VibeAgent/tasks/` for current open/in_progress tasks.
3. If intended work does not match `VibeAgent/ROADMAP.md`, update with rationale.

## Strict Health Enforcements
- Health in `STATUS.md` must be exactly one of: GREEN, YELLOW, or RED.

## Quarantine-First Enforcements
- Never delete files outright without reason.
- Move them to `VibeAgent/quarantine/` and log them in `VibeAgent/quarantine/REGISTRY.md`.
- Applies to old project docs when onboarding VibeAgent into an existing codebase.

## Session Close (MUST)
*Skip if `#lite` flag is present in prompt.*
1. Update `VibeAgent/tasks/`
2. Update `VibeAgent/STATUS.md`
3. Update `VibeAgent/ROADMAP.md`
4. Create a session note: `VibeAgent/sessions/YYYY-MM-DD_{AGENT}_{objective_slug}.md`
5. **Session Archiving**: If `sessions/` has >10 files, compress the 5 oldest into `sessions/archive/WEEK_{X}_{SUMMARY}.md`.
6. Run: `node VibeAgent/_tools/validate.js`
7. **You must pass validation before completing work for the human.**
```

---

## VibeAgent/STATUS.md

```markdown
# Status

## Health
- Overall: GREEN
- Top blockers: None

## Stage
- Current: Stage 0 (Canon Bootstrap) — DONE

## Progress
- VibeAgent structure created
- AGENTS.md deployed

## Risks
- Tracked in `VibeAgent/RISKS.md`
```

---

## VibeAgent/ROADMAP.md

```markdown
# Roadmap

## Objective
Establish a **living canon** for {PROJECT_NAME}.

## In scope
- Canon structure and SSOT registry
- Task backlog creation
- Architecture documentation

## Out of scope
- New features (until canon is stable)

## Immediate Next (P0/P1)
1. Define product contract and glossary
2. Map architecture
3. Create initial tasks in `tasks/`
4. Set up stage plan

## Completed
### Stage 0: Canon Bootstrap ({DATE})
- VibeAgent/ structure created
- AGENTS.md deployed
```

---

## VibeAgent/tasks/TASK_{DATE}_{ID}_{SLUG}-template.md

```markdown
---
id: "TASK_{DATE_COMPACT}_0001"
title: "Bootstrap VibeAgent governance"
status: "in_progress"
priority: "P0"
owner: "{AGENT}"
created_at: "{DATE}"
updated_at: "{DATE}"
---

# Scope & Motivation
No governance structure existed. Start tracking tasks here in the markdown format.

## Definition of Done (Checklist)
- [x] VibeAgent/ directory created with all required files
- [ ] AGENTS.md deployed at project root
- [ ] pre-commit Git hook recommended or created (if requested)
- [ ] Validation passing

## Blockers / Notes
None yet.
```

---

## VibeAgent/KNOWLEDGE.md

```markdown
# SSOT & Knowledge Registry

One source of truth per domain. If a claim contradicts code — code wins, doc gets marked `stale`.

| Domain | SSOT |
|--------|------|
| Project status | `VibeAgent/STATUS.md` |
| Tasks & Backlog| `VibeAgent/tasks/` |
| Architecture | `VibeAgent/ARCHITECTURE.md` + `VibeAgent/MAP.yaml` |
| Product contract | `VibeAgent/PRODUCT_CONTRACT.md` |
| Glossary | `VibeAgent/GLOSSARY.md` |
| Risks | `VibeAgent/RISKS.md` |
| Quarantine log | `VibeAgent/quarantine/REGISTRY.md` |

## Core Business Rules
[List any foundational logic, such as "Users must have emails", "Data is synced daily", etc.]
```

---

## VibeAgent/GLOSSARY.md

```markdown
# Glossary
| Term | Definition |
|------|-----------|
| Canon | The `VibeAgent/` directory — single source of truth |
| DoD | Definition of Done |
| Session | An interaction block marked by Session Start and Close |
```

---

## VibeAgent/ARCHITECTURE.md

```markdown
# Architecture

## Overview
[Describe architecture of {PROJECT_NAME}]

## Evidence Rules
- File pointers like `path/to/file.ts:42` are required for architecture claims.
```

---

## VibeAgent/PRODUCT_CONTRACT.md

```markdown
# Product Contract — {PROJECT_NAME}

## Personas
[Define target users]

## Surfaces
[Define UI surfaces / interfaces]

## Must-Win Scenarios
[Define MVP success scenarios]
```

---

## VibeAgent/STREAMS.md

```markdown
# Parallel Streams

| Stream | Focus | Owner | Merge Gate |
|--------|-------|-------|-----------|
| 1. Canon/Governance | VibeAgent/, KNOWLEDGE, quarantine | TBD | VibeAgent validate passes |
```

---

## VibeAgent/RISKS.md

```markdown
# Risks

| ID | Risk | Impact | Likelihood | Mitigation | Status |
|----|------|--------|-----------|------------|--------|
| R1 | [Risk description] | High/Med/Low | High/Med/Low | [Mitigation plan] | Open |
```

---

## VibeAgent/METADATA.yaml

```yaml
pack_version: 1
project:
  id: "{PROJECT_ID}"
  name: "{PROJECT_NAME}"
  department: "{DEPARTMENT}"
  target_quarter: "Q3 2026"
  created_at: "{DATE}"
  last_updated: "{DATE}"

owners:
  - name: "TBD"
    role: "Lead"
    contact: "TBD"

conventions:
  timezone: "UTC"
  freshness_sla_days: 7
  id_prefixes:
    tasks: "TASK"
    subsystems: "SUBSYS"
    components: "COMP"
    flows: "FLOW"
    flow_steps: "STEP"
    prompts: "PROMPT"
    research: "RES"
    commands: "CMD"
```

---

## VibeAgent/MAP.yaml

```yaml
map_version: 1
subsystems:
  - id: "SUBSYS_{DATE_COMPACT}_0001"
    name: "VibeAgent Governance"
    summary: "Canon, validation, session protocol"
    owner: "TBD"
    component_ids:
      - "COMP_{DATE_COMPACT}_0001"
    flow_ids: []

components:
  - id: "COMP_{DATE_COMPACT}_0001"
    name: "Canon Files"
    summary: "YAML/MD files forming the single source of truth"
    subsystem_id: "SUBSYS_{DATE_COMPACT}_0001"
    owner: "TBD"
    paths:
      - "VibeAgent/"
    depends_on_components: []

flows: []
flow_steps: []
```

---

## VibeAgent/COMMANDS.yaml

```yaml
commands_version: 1
command_groups:
  - id: "CMD_GROUP_GOVERNANCE"
    title: "Governance"
    commands:
      - id: "CMD_VALIDATE"
        title: "Validate canon"
        description: "Run VibeAgent validator to check integrity"
        copy_text: "node VibeAgent/_tools/validate.js"
      - id: "CMD_CLOSE"
        title: "Close session"
        description: "Enforce session close with validation"
        copy_text: "node VibeAgent/_tools/close-session.js"
```

---

## VibeAgent/decisions/0001-template.md

```markdown
# ADR 0001: [Title]
## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
[What is the issue that we're seeing that is motivating this decision?]

## Decision
[What is the change that we're proposing and/or doing?]

## Consequences
[What becomes easier or more difficult to do because of this change?]
```

---

## VibeAgent/sessions/README.md

```markdown
# Sessions
Session notes are stored using the naming convention: `YYYY-MM-DD_{AGENT}_{objective_slug}.md`

## Archive
Old notes will be compressed and moved to `archive/WEEK_X_SUMMARY.md` automatically by agents upon session close if the directory contains more than 10 files.
```

---

## VibeAgent/research/README.md

```markdown
# Research
Research artifacts are stored in subdirectories and indexed in `INDEX.yaml`.
```

---

## VibeAgent/research/INDEX.yaml

```yaml
research_version: 1
items: []
```

---

## VibeAgent/userprompts/README.md

```markdown
# User Prompts
Prompt library for reusable agent prompts. Indexed in `INDEX.yaml`.
```

---

## VibeAgent/userprompts/INDEX.yaml

```yaml
prompts_version: 1
prompts: []
```

---

## VibeAgent/quarantine/REGISTRY.md

```markdown
# Quarantine Registry

Log deleted or replaced files here before physically moving them to this directory. Vital for codebase onboarding!

| Date | Source Path | Reason | Action Taken |
|------|-------------|--------|--------------|
```
