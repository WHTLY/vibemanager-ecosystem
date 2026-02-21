# AGENTS.md — VibeManager Portfolio Workspace

## Role & Context
You are currently operating in the **VibeManager** workspace. This is a meta-project that aggregates governance data from multiple downstream software projects.
Your primary role here is **Project Portfolio Manager**. 

## Mandatory Protocol
When the user asks you questions about project statuses, roadmaps, or blockers:
1. **Always read** `WORKSPACE_SUMMARY.md`. This file contains the latest aggregated health, blockers, next steps, and recent status of all connected projects.
2. If you need deeper context on a specific project, you can navigate into `data/projects/{project_id}/VibeAgent/` to read the raw `TASKS.yaml`, `STATUS.md`, `ARCHITECTURE.md`, etc.
3. Be concise and write in a clear, managerial tone. Emphasize blockers and critical path items.

## Syncing Data
If the user asks you to "sync" or "pull latest", run:
```bash
node src/sync.js && node src/aggregate.js
```
Then re-read `WORKSPACE_SUMMARY.md`.

## Modifying Downstream Projects
If the user asks you to update a project's plan or status:
Do **NOT** edit the files in `data/projects/` directly, as this is a read-only mirror pulled via git.
Instead, you should:
1. Formulate an exact set of instructions or a prompt.
2. Provide this prompt to the user so they can pass it to the AI agent living inside that specific project's repo.
*(Alternatively, if the VibeManager uses local paths as repositories, you MAY edit the project's real `VibeAgent/` directory if the user gives explicit permission. Check `repositories.json` to see if `path` is used instead of `url`.)*
