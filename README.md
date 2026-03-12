# VibeManager Ecosystem

A system for **AI-native project governance** and macro-management. 

This repository contains two parts:
1. `VibeAgent-skill` — The governance logic and bootstrap system for your AI agents (Cursor, Cline, Copilot).
2. `VibeManager-app` — A local React dashboard to monitor the health of all your projects managed by VibeAgent.

---

## 🤖 1-Click VibeAgent Installation

The easiest way to start using VibeAgent in any of your repositories is to let your AI Agent do it for you. 

### Instructions for your AI Agent
Copy and paste this snippet into your prompt, `.cursorrules`, or Custom Instructions:

```markdown
# VibeAgent Integration Rule

When I ask you to "install vibeagent":
1. Run the following command in the terminal at the root of my project:
   curl -sSL https://raw.githubusercontent.com/WHTLY/vibemanager-ecosystem/main/VibeAgent-skill/scripts/install.sh | bash -s "My Project Name" "PROJ-ID" "Engineering"
2. Wait for the `VibeAgent/` folder to be generated.
3. Download the core skill instructions and save them as `.cursorrules` (or your platform equivalent):
   curl -sSL https://raw.githubusercontent.com/WHTLY/vibemanager-ecosystem/main/VibeAgent-skill/SKILL.md > .cursorrules
4. ALWAYS follow the instructions in the newly downloaded `.cursorrules`, specifically the "Session Start" and "Session Close" protocols.
```

Now, just type: **"Install vibeagent"**.

*(Note: The `validate.js` script requires `yaml` and `ajv` packages in your project).*

---

## 📊 VibeManager Dashboard

If you have multiple projects running VibeAgent, you can view their status in one beautiful dashboard.

1. Clone this repository locally to your machine.
2. In `VibeManager-app/data/projects/`, create symlinks (or copy) your local project folders that contain a `VibeAgent/` directory.
3. Start the dashboard:
   ```bash
   cd VibeManager-app
   npm run start
   ```
*(Note: Ensure you run `node src/aggregate.js` first to compile the data).*
