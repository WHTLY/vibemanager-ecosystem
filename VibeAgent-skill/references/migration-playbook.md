# Migration Playbook

Use this reference when the project already contains any governance system, harness, canon, prompt pack, agent rules, or operational docs that overlap with VibeAgent.

## Goals

- Preserve useful signal, not legacy layout.
- Give the user clear visibility into what will be created, moved, quarantined, or kept.
- Re-home valuable legacy practices into canonical VibeAgent destinations.
- Avoid destructive migration. Prefer shadow mode and quarantine-first defaults.

## Migration Workflow

1. Audit the repo for existing governance artifacts.
2. Summarize what was detected for the user in plain language.
3. Ask the pre-migration questionnaire before writing or moving files.
4. Decide migration mode: replace, shadow, or phased.
5. If using one-click bootstrap, rerun it with explicit migration flags only after the questionnaire is answered.
6. Bootstrap or upgrade VibeAgent core files.
7. Import useful extras into canonical destinations.
8. Quarantine superseded artifacts and log the mapping.
9. Validate the resulting canon before declaring migration complete.

Suggested bootstrap flags:
- `--migration-mode=replace|shadow|phased`
- `--authoritative=path1,path2`
- `--import-extras=prompts,commands,rules,research,architecture,sessions,tasks`
- `--quarantine=immediate|after-validate`
- `--protect=path1,path2`

## Pre-Migration Questionnaire

Ask these questions before migration:

1. Do you want VibeAgent to replace the current harness immediately, run in parallel for a while, or be introduced in phases?
2. Which current files or folders are still authoritative and must remain active during migration?
3. Which categories should be imported as extras if found: prompts, commands, rules/guardrails, research notes, architecture docs, session history, open tasks?
4. Should legacy artifacts be quarantined immediately after import, or kept in place until the new canon is validated?
5. Are there any files or directories that must not be moved, rewritten, or absorbed automatically?

If the user is unavailable, use the safest default:
- migration mode: `shadow`
- deletion: `none`
- handling: quarantine-first
- extras: import only clearly reusable material

## Recommended Migration Modes

- `replace`: VibeAgent becomes the new source of truth immediately. Use only when the user explicitly approves.
- `shadow`: Create VibeAgent alongside the old harness, import key material, and delay retirement of legacy files until validation and user review.
- `phased`: Migrate one category at a time, such as tasks first, then prompts, then architecture.

## Legacy Artifact Mapping

| Legacy Artifact Type | Examples | Preferred VibeAgent Destination |
|----------------------|----------|---------------------------------|
| Active tasks / TODOs | `TODO.md`, `TASKS.md`, backlog docs | `VibeAgent/tasks/` |
| Roadmaps / plans | `ROADMAP.md`, `PLAN.md`, sprint docs | `VibeAgent/ROADMAP.md` |
| Agent rules / harness guardrails | `AGENTS.md`, `.cursorrules`, `CLAUDE.md` | `AGENTS.md`, `VibeAgent/INSTRUCTIONS.md`, `VibeAgent/KNOWLEDGE.md`, `VibeAgent/LESSONS.md` |
| Prompt libraries | prompt packs, macros, reusable prompts | `VibeAgent/userprompts/` + `INDEX.yaml` |
| Command recipes / runbooks | command cheat sheets, ops playbooks | `VibeAgent/COMMANDS.yaml` |
| Research notes | exploration docs, benchmarks, investigations | `VibeAgent/research/` + `INDEX.yaml` |
| Architecture docs | ADRs, subsystem notes, diagrams | `VibeAgent/ARCHITECTURE.md`, `VibeAgent/MAP.yaml`, `VibeAgent/decisions/` |
| Session history | work logs, journals, standup notes | `VibeAgent/sessions/` or `sessions/archive/` |
| Recurring mistakes / corrections | postmortems, gotchas, anti-pattern lists | `VibeAgent/LESSONS.md` |

## Importing Useful Extras

Do not treat migration as “copy the old canon into quarantine and forget it.” If the legacy harness contains durable improvements, implement them directly into VibeAgent:

- Better guardrails → merge into `AGENTS.md` or `INSTRUCTIONS.md`
- High-value prompt snippets → convert into `userprompts/`
- Helpful operational commands → add to `COMMANDS.yaml`
- Durable architecture facts → fold into `ARCHITECTURE.md` or `MAP.yaml`
- Reusable checklists → move into task templates or close-session workflow
- Repeat failure patterns → record in `LESSONS.md`

When you implement a useful extra, note both the source artifact and the new destination in `quarantine/REGISTRY.md`.

## Audit Output Expectations

When reporting migration findings to the user, include:

- what was detected
- what VibeAgent will create
- what will be imported as extras
- what will be quarantined
- what will remain untouched
- which migration mode you recommend and why

## Safety Rules

- Never silently delete a legacy harness artifact.
- Do not overwrite existing sources of truth without user awareness.
- If two docs disagree, preserve both until the user chooses the authoritative one.
- Prefer importing structured knowledge over copying large legacy files verbatim.
