#!/usr/bin/env node
/**
 * VibeAgent Auto-Bootstrap
 * This script downloads the required canonical templates and schemas,
 * replaces placeholders, and generates the VibeAgent directory structure.
 */

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const projectName = args[0] || 'My Project';
const projectId = args[1] || 'PROJ-001';
const department = args[2] || 'Engineering';

const date = new Date().toISOString().split('T')[0];
const dateCompact = date.replace(/-/g, '_');
const agent = 'auto-bootstrap';

const rootDir = path.join(process.cwd(), 'VibeAgent');
const legacyHarnessCandidates = [
    'AGENTS.md',
    '.cursorrules',
    '.clinerules',
    'CLAUDE.md',
    'GEMINI.md',
    'COPILOT.md',
    'RULES.md',
    '.github/copilot-instructions.md',
    '.cursor/rules',
    'TODO.md',
    'ROADMAP.md'
];

// Fallback template URL (from GitHub raw)
const TEMPLATES_URL = "https://raw.githubusercontent.com/WHTLY/vibemanager-ecosystem/main/VibeAgent-skill/references/bootstrap-templates.md";

console.log(`🚀 Auto-Bootstrapping VibeAgent Canon for: ${projectName} (${projectId})`);

if (fs.existsSync(path.join(rootDir, 'METADATA.yaml'))) {
    console.warn('⚠️ VibeAgent/ already has METADATA.yaml; overwriting. Re-run with same args to refresh.');
}

function detectLegacyHarnessArtifacts() {
    return legacyHarnessCandidates.filter((candidate) => fs.existsSync(path.join(process.cwd(), candidate)));
}

function printMigrationNotice(artifacts) {
    if (artifacts.length === 0) {
        return;
    }

    console.warn('\n⚠️ Migration-aware bootstrap notice: detected existing governance artifacts:');
    artifacts.forEach((artifact) => console.warn(`  - ${artifact}`));
    console.warn('\nBefore retiring or quarantining legacy governance, confirm with the user:');
    console.warn('  1. Replace current harness now, run in shadow mode, or migrate in phases?');
    console.warn('  2. Which existing files stay authoritative during migration?');
    console.warn('  3. Which useful extras should be imported (prompts, commands, rules, research, tasks)?');
    console.warn('  4. Should legacy artifacts be quarantined immediately or only after validation?');
    console.warn('  5. Are there any files that must not be moved or rewritten automatically?');
    console.warn('\nRecommended next step: run the migration audit workflow before deleting or overwriting anything.');
}

printMigrationNotice(detectLegacyHarnessArtifacts());

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

// 4. Deploy _schemas from references/schemas.md
async function deploySchemas() {
    const BASE_RAW_URL = "https://raw.githubusercontent.com/WHTLY/vibemanager-ecosystem/main/VibeAgent-skill";
    try {
        const schemasMdResponse = await fetch(`${BASE_RAW_URL}/references/schemas.md`);
        const schemasMd = await schemasMdResponse.text();
        const schemaRegex = /## ([^\n]+\.schema\.json)\n+```json\n([\s\S]*?)```/g;
        let match;
        let count = 0;
        while ((match = schemaRegex.exec(schemasMd)) !== null) {
            const filename = match[1].trim();
            const content = match[2];
            fs.writeFileSync(path.join(rootDir, '_schemas', filename), content, 'utf8');
            count++;
            console.log(`  📝 Created: VibeAgent/_schemas/${filename}`);
        }
    } catch (e) {
        console.warn('⚠️ Could not fetch schemas:', e.message);
    }
}

// 5. Download additional tools directly
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
    await deploySchemas();

    console.log(`\n✅ Successfully generated ${count} canon files.`);

    // Add AGENTS.md to the root (extract inner markdown block, then replace placeholders)
    try {
        const agentsResponse = await fetch("https://raw.githubusercontent.com/WHTLY/vibemanager-ecosystem/main/VibeAgent-skill/references/agents-md-template.md");
        const agentsMdRaw = await agentsResponse.text();
        const openFence = '```markdown\n';
        const startIdx = agentsMdRaw.indexOf(openFence);
        let agentsContent = agentsMdRaw;
        if (startIdx !== -1) {
            const contentStart = startIdx + openFence.length;
            const lastFence = agentsMdRaw.lastIndexOf('\n```');
            if (lastFence > contentStart) {
                agentsContent = agentsMdRaw.slice(contentStart, lastFence);
            }
        }
        agentsContent = agentsContent
            .replace(/{PROJECT_NAME}/g, projectName)
            .replace(/{PROJECT_ID}/g, projectId)
            .replace(/{DEPARTMENT}/g, department);
        const legacyAgentsPath = path.join(process.cwd(), 'AGENTS.md');
        const quarantineAgentsPath = path.join(rootDir, 'quarantine', 'AGENTS.pre-vibeagent.md');
        if (fs.existsSync(legacyAgentsPath)) {
            fs.copyFileSync(legacyAgentsPath, quarantineAgentsPath);
            console.log(`  🗃️ Preserved existing AGENTS.md at: VibeAgent/quarantine/AGENTS.pre-vibeagent.md`);
        }
        fs.writeFileSync(path.join(process.cwd(), 'AGENTS.md'), agentsContent, 'utf8');
        console.log(`  📝 Created: AGENTS.md (Root level)`);
    } catch (e) {
        console.warn('⚠️ Could not fetch AGENTS.md template');
    }

    console.log(`\n🎉 VibeAgent Bootstrap Complete!`);
    console.log(`Dependencies: To run validations, install: npm install yaml ajv ajv-formats`);
}

run();
