#!/usr/bin/env node
/**
 * VibeAgent Auto-Bootstrap
 * This script downloads the required canonical templates and schemas,
 * replaces placeholders, and generates the VibeAgent directory structure.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const projectName = args[0] || 'My Project';
const projectId = args[1] || 'PROJ-001';
const department = args[2] || 'Engineering';

const date = new Date().toISOString().split('T')[0];
const dateCompact = date.replace(/-/g, '_');
const agent = 'auto-bootstrap';

const rootDir = path.join(process.cwd(), 'VibeAgent');

// Fallback template URL (from GitHub raw)
const TEMPLATES_URL = "https://raw.githubusercontent.com/WHTLY/vibemanager-ecosystem/main/VibeAgent-skill/references/bootstrap-templates.md";

console.log(`🚀 Auto-Bootstrapping VibeAgent Canon for: ${projectName} (${projectId})`);

// 1. Create Directories
const dirs = [
    'tasks',
    'specs/mvp',
    'decisions',
    'sessions/archive',
    'research',
    'userprompts',
    'quarantine',
    '_tools',
    '_schemas'
];

dirs.forEach(d => {
    fs.mkdirSync(path.join(rootDir, d), { recursive: true });
});

// 2. Fetch Templates
async function fetchTemplates() {
    console.log(`📥 Fetching templates from GitHub...`);
    try {
        const response = await fetch(TEMPLATES_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.text();
    } catch (e) {
        console.error("❌ Failed to fetch templates. Make sure you have internet access and the repository is public/accessible.");
        process.exit(1);
    }
}

// 3. Parse and Write Files
function parseAndWriteFiles(templateMarkdown) {
    // Regex matches: ## VibeAgent/filename.md\n\n```ext\nCONTENT\n```
    const regex = /## (VibeAgent\/[^\n]+)\n+```[a-z]*\n([\s\S]*?)```/g;
    let match;
    let filesCreated = 0;

    while ((match = regex.exec(templateMarkdown)) !== null) {
        let filePath = match[1].trim();
        let content = match[2];

        // Replace placeholders
        content = content.replace(/{PROJECT_NAME}/g, projectName);
        content = content.replace(/{PROJECT_ID}/g, projectId);
        content = content.replace(/{DEPARTMENT}/g, department);
        content = content.replace(/{DATE}/g, date);
        content = content.replace(/{DATE_COMPACT}/g, dateCompact);
        content = content.replace(/{AGENT}/g, agent);

        // Handle template renaming
        if (filePath.includes('TASK_{DATE}_{ID}_{SLUG}-template.md')) {
            filePath = filePath.replace('TASK_{DATE}_{ID}_{SLUG}-template.md', `TASK_${dateCompact}_0001_bootstrap-vibeagent.md`);
        }

        const absolutePath = path.join(process.cwd(), filePath);

        // Ensure parent dir exists (e.g. for VibeAgent/tasks/...)
        fs.mkdirSync(path.dirname(absolutePath), { recursive: true });

        fs.writeFileSync(absolutePath, content, 'utf8');
        filesCreated++;
        console.log(`  📝 Created: ${filePath}`);
    }
    return filesCreated;
}

// 4. Download additional tools directly
async function downloadTools() {
    console.log(`📥 Fetching validator tools...`);
    const BASE_RAW_URL = "https://raw.githubusercontent.com/WHTLY/vibemanager-ecosystem/main/VibeAgent-skill";

    try {
        // We can just rely on the references/validate-js.md to be parsed if we included it in the overarching templates.
        // But for robust separation, let's fetch references/validate-js.md and extract the two scripts.
        const toolsMdResponse = await fetch(`${BASE_RAW_URL}/references/validate-js.md`);
        const toolsMd = await toolsMdResponse.text();

        // Extract validate.js
        const validateMatch = toolsMd.match(/```javascript\n([\s\S]*?)```/);
        if (validateMatch) {
            fs.writeFileSync(path.join(rootDir, '_tools', 'validate.js'), validateMatch[1], 'utf8');
            console.log(`  📝 Created: VibeAgent/_tools/validate.js`);
        }

        // Extract close-session.js
        const closeMatch = toolsMd.match(/### close-session\.js\n\n```javascript\n([\s\S]*?)```/);
        if (closeMatch) {
            fs.writeFileSync(path.join(rootDir, '_tools', 'close-session.js'), closeMatch[1], 'utf8');
            console.log(`  📝 Created: VibeAgent/_tools/close-session.js`);
        }

    } catch (e) {
        console.error("❌ Failed to fetch validator scripts.", e);
    }
}

async function run() {
    const templatesMd = await fetchTemplates();
    const count = parseAndWriteFiles(templatesMd);

    await downloadTools();

    console.log(`\n✅ Successfully generated ${count} canon files.`);

    // Add AGENTS.md to the root
    try {
        const agentsResponse = await fetch("https://raw.githubusercontent.com/WHTLY/vibemanager-ecosystem/main/VibeAgent-skill/references/agents-md-template.md");
        const agentsMd = await agentsResponse.text();
        fs.writeFileSync(path.join(process.cwd(), 'AGENTS.md'), agentsMd, 'utf8');
        console.log(`  📝 Created: AGENTS.md (Root level)`);
    } catch (e) {
        console.warn('⚠️ Could not fetch AGENTS.md template');
    }

    console.log(`\n🎉 VibeAgent Bootstrap Complete!`);
    console.log(`Dependencies note: To run validations, the project needs 'yaml' and 'ajv' npm packages.`);
}

run();
