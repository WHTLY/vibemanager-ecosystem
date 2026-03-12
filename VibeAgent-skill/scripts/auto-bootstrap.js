#!/usr/bin/env node
/**
 * VibeAgent Auto-Bootstrap
 * This script downloads the required canonical templates and schemas,
 * replaces placeholders, and generates the VibeAgent directory structure.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function parseArgs(argv) {
    const positional = [];
    const flags = {};

    for (const arg of argv) {
        if (!arg.startsWith('--')) {
            positional.push(arg);
            continue;
        }

        const withoutPrefix = arg.slice(2);
        const eqIndex = withoutPrefix.indexOf('=');
        if (eqIndex === -1) {
            flags[withoutPrefix] = 'true';
            continue;
        }

        const key = withoutPrefix.slice(0, eqIndex);
        const value = withoutPrefix.slice(eqIndex + 1);
        flags[key] = value;
    }

    return { positional, flags };
}

function splitCsv(value) {
    if (!value) {
        return [];
    }

    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

const { positional, flags } = parseArgs(process.argv.slice(2));
const projectName = positional[0] || 'My Project';
const projectId = positional[1] || 'PROJ-001';
const department = positional[2] || 'Engineering';
const migrationMode = flags['migration-mode'] || '';
const authoritativePaths = splitCsv(flags.authoritative);
const importExtras = splitCsv(flags['import-extras']);
const protectedPaths = splitCsv(flags.protect);
const quarantineMode = flags.quarantine || 'after-validate';
const validMigrationModes = new Set(['replace', 'shadow', 'phased']);
const validQuarantineModes = new Set(['immediate', 'after-validate']);

const date = new Date().toISOString().split('T')[0];
const dateCompact = date.replace(/-/g, '_');
const agent = 'auto-bootstrap';

const rootDir = path.join(process.cwd(), 'VibeAgent');
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const legacyHarnessCandidates = [
    { path: 'VibeAgent', category: 'Existing VibeAgent canon' },
    { path: 'AGENTS.md', category: 'Governance rules' },
    { path: '.cursorrules', category: 'Governance rules' },
    { path: '.clinerules', category: 'Governance rules' },
    { path: 'CLAUDE.md', category: 'Governance rules' },
    { path: 'GEMINI.md', category: 'Governance rules' },
    { path: 'COPILOT.md', category: 'Governance rules' },
    { path: 'RULES.md', category: 'Governance rules' },
    { path: '.github/copilot-instructions.md', category: 'Governance rules' },
    { path: '.cursor/rules', category: 'Governance rules' },
    { path: 'TODO.md', category: 'Tasks / Roadmaps' },
    { path: 'TASKS.md', category: 'Tasks / Roadmaps' },
    { path: 'ROADMAP.md', category: 'Tasks / Roadmaps' },
    { path: 'PLAN.md', category: 'Tasks / Roadmaps' },
    { path: 'plans.md', category: 'Tasks / Roadmaps' },
    { path: 'prompts', category: 'Prompt libraries' },
    { path: 'promptlib', category: 'Prompt libraries' },
    { path: 'runbook.md', category: 'Commands / Runbooks' },
    { path: 'ops.md', category: 'Commands / Runbooks' }
];

// Fallback template URL (from GitHub raw)
const TEMPLATES_URL = "https://raw.githubusercontent.com/WHTLY/vibemanager-ecosystem/main/VibeAgent-skill/references/bootstrap-templates.md";
const AGENTS_URL = "https://raw.githubusercontent.com/WHTLY/vibemanager-ecosystem/main/VibeAgent-skill/references/agents-md-template.md";
const TOOLS_URL = "https://raw.githubusercontent.com/WHTLY/vibemanager-ecosystem/main/VibeAgent-skill/references/validate-js.md";
const SCHEMAS_URL = "https://raw.githubusercontent.com/WHTLY/vibemanager-ecosystem/main/VibeAgent-skill/references/schemas.md";

console.log(`🚀 Auto-Bootstrapping VibeAgent Canon for: ${projectName} (${projectId})`);

if (migrationMode && !validMigrationModes.has(migrationMode)) {
    console.error(`❌ Invalid --migration-mode=${migrationMode}. Use replace, shadow, or phased.`);
    process.exit(1);
}

if (!validQuarantineModes.has(quarantineMode)) {
    console.error(`❌ Invalid --quarantine=${quarantineMode}. Use immediate or after-validate.`);
    process.exit(1);
}

function detectLegacyHarnessArtifacts() {
    return legacyHarnessCandidates
        .filter((candidate) => fs.existsSync(path.join(process.cwd(), candidate.path)));
}

function detectPackageManager() {
    if (fs.existsSync(path.join(process.cwd(), 'pnpm-lock.yaml'))) return 'pnpm';
    if (fs.existsSync(path.join(process.cwd(), 'yarn.lock'))) return 'yarn';
    if (fs.existsSync(path.join(process.cwd(), 'bun.lockb')) || fs.existsSync(path.join(process.cwd(), 'bun.lock'))) return 'bun';
    return 'npm';
}

function packageScriptCommand(packageManager, script) {
    switch (packageManager) {
        case 'pnpm':
            return `pnpm ${script}`;
        case 'yarn':
            return `yarn ${script}`;
        case 'bun':
            return `bun run ${script}`;
        case 'npm':
        default:
            return `npm run ${script}`;
    }
}

function readTextIfExists(filePath) {
    if (!fs.existsSync(filePath)) {
        return '';
    }

    return fs.readFileSync(filePath, 'utf8');
}

function detectCommandGroups() {
    const groups = [{
        id: 'CMD_GROUP_GOVERNANCE',
        title: 'Governance',
        commands: [
            {
                id: 'CMD_VALIDATE',
                title: 'Validate canon',
                description: 'Run VibeAgent validator to check integrity',
                copy_text: 'node VibeAgent/_tools/validate.js',
            },
            {
                id: 'CMD_CLOSE',
                title: 'Close session',
                description: 'Enforce session close with validation and required verification commands',
                copy_text: 'node VibeAgent/_tools/close-session.js',
            },
        ],
    }];

    const verificationCommands = [];
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            const scripts = packageJson.scripts || {};
            const packageManager = detectPackageManager();
            const compositeScript = ['check', 'verify', 'ci'].find((name) => typeof scripts[name] === 'string');

            if (compositeScript) {
                verificationCommands.push({
                    id: `CMD_${compositeScript.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}`,
                    title: `Run ${compositeScript}`,
                    description: `Autodetected composite verification script from package.json (${packageManager})`,
                    copy_text: packageScriptCommand(packageManager, compositeScript),
                    required_for_done: true,
                });
            } else {
                const requiredScripts = [
                    ['test', 'Run tests'],
                    ['lint', 'Run lint'],
                    ['typecheck', 'Run typecheck'],
                ];
                for (const [scriptName, title] of requiredScripts) {
                    if (typeof scripts[scriptName] === 'string') {
                        verificationCommands.push({
                            id: `CMD_${scriptName.toUpperCase()}`,
                            title,
                            description: `Autodetected verification script from package.json (${packageManager})`,
                            copy_text: packageScriptCommand(packageManager, scriptName),
                            required_for_done: true,
                        });
                    }
                }
            }

            if (typeof scripts.build === 'string') {
                verificationCommands.push({
                    id: 'CMD_BUILD',
                    title: 'Run build',
                    description: `Autodetected build script from package.json (${detectPackageManager()})`,
                    copy_text: packageScriptCommand(packageManager, 'build'),
                    required_for_done: false,
                });
            }
        } catch (error) {
            console.warn(`⚠️ Could not parse package.json for command detection: ${error.message}`);
        }
    } else if (fs.existsSync(path.join(process.cwd(), 'go.mod'))) {
        verificationCommands.push({
            id: 'CMD_TEST',
            title: 'Run go tests',
            description: 'Autodetected Go test command',
            copy_text: 'go test ./...',
            required_for_done: true,
        });
        verificationCommands.push({
            id: 'CMD_BUILD',
            title: 'Run go build',
            description: 'Autodetected Go build command',
            copy_text: 'go build ./...',
            required_for_done: false,
        });
    } else if (fs.existsSync(path.join(process.cwd(), 'Cargo.toml'))) {
        verificationCommands.push({
            id: 'CMD_TEST',
            title: 'Run cargo test',
            description: 'Autodetected Rust test command',
            copy_text: 'cargo test',
            required_for_done: true,
        });
        verificationCommands.push({
            id: 'CMD_BUILD',
            title: 'Run cargo build',
            description: 'Autodetected Rust build command',
            copy_text: 'cargo build',
            required_for_done: false,
        });
    } else if (
        fs.existsSync(path.join(process.cwd(), 'pyproject.toml')) ||
        fs.existsSync(path.join(process.cwd(), 'requirements.txt')) ||
        fs.existsSync(path.join(process.cwd(), 'setup.py'))
    ) {
        const pyproject = readTextIfExists(path.join(process.cwd(), 'pyproject.toml'));
        const hasPytest = fs.existsSync(path.join(process.cwd(), 'pytest.ini')) ||
            fs.existsSync(path.join(process.cwd(), 'tests')) ||
            pyproject.includes('pytest');
        const hasRuff = fs.existsSync(path.join(process.cwd(), '.ruff.toml')) ||
            pyproject.includes('ruff');

        if (hasPytest) {
            verificationCommands.push({
                id: 'CMD_TEST',
                title: 'Run pytest',
                description: 'Autodetected Python test command',
                copy_text: 'pytest',
                required_for_done: true,
            });
        }

        if (hasRuff) {
            verificationCommands.push({
                id: 'CMD_LINT',
                title: 'Run ruff',
                description: 'Autodetected Python lint command',
                copy_text: 'ruff check .',
                required_for_done: false,
            });
        }
    }

    if (verificationCommands.length > 0) {
        groups.push({
            id: 'CMD_GROUP_VERIFICATION',
            title: 'Verification',
            commands: verificationCommands,
        });
    }

    return groups;
}

function yamlScalar(value) {
    return JSON.stringify(value);
}

function renderCommandsYaml() {
    const groups = detectCommandGroups();
    const lines = [
        'commands_version: 1',
        'command_groups:',
    ];

    for (const group of groups) {
        lines.push(`  - id: ${yamlScalar(group.id)}`);
        lines.push(`    title: ${yamlScalar(group.title)}`);
        lines.push('    commands:');
        for (const command of group.commands) {
            lines.push(`      - id: ${yamlScalar(command.id)}`);
            lines.push(`        title: ${yamlScalar(command.title)}`);
            if (command.description) {
                lines.push(`        description: ${yamlScalar(command.description)}`);
            }
            lines.push(`        copy_text: ${yamlScalar(command.copy_text)}`);
            if (typeof command.required_for_done === 'boolean') {
                lines.push(`        required_for_done: ${command.required_for_done ? 'true' : 'false'}`);
            }
        }
    }

    return `${lines.join('\n')}\n`;
}

function printMigrationNotice(artifacts) {
    if (artifacts.length === 0) {
        return;
    }

    console.warn('\n⚠️ Migration-aware bootstrap preflight detected existing governance artifacts:');
    artifacts.forEach((artifact) => console.warn(`  - [${artifact.category}] ${artifact.path}`));
    console.warn('\nBefore bootstrapping into this repo, confirm with the user:');
    console.warn('  1. Replace current harness now, run in shadow mode, or migrate in phases?');
    console.warn('  2. Which existing files stay authoritative during migration?');
    console.warn('  3. Which useful extras should be imported (prompts, commands, rules, research, tasks)?');
    console.warn('  4. Should legacy artifacts be quarantined immediately or only after validation?');
    console.warn('  5. Are there any files that must not be moved or rewritten automatically?');
    console.warn('\nMigration defaults are intentionally blocked until intent is explicit.');
    console.warn('Recommended next step: run the migration audit workflow before deleting or overwriting anything.');
    console.warn(`Re-run bootstrap with an explicit mode, for example:`);
    console.warn(`  node auto-bootstrap.js "${projectName}" "${projectId}" "${department}" --migration-mode=shadow --quarantine=after-validate`);
    console.warn('Optional flags: --authoritative=path1,path2 --import-extras=prompts,commands --protect=path1,path2');
}

const detectedLegacyArtifacts = detectLegacyHarnessArtifacts();
printMigrationNotice(detectedLegacyArtifacts);

if (detectedLegacyArtifacts.length > 0 && !migrationMode) {
    console.error('\n❌ Refusing to write VibeAgent files into a repo with existing harness artifacts without explicit migration flags.');
    process.exit(2);
}

const effectiveMigrationMode = detectedLegacyArtifacts.length > 0 ? migrationMode : 'none';

if (effectiveMigrationMode !== 'none') {
    console.log(`📋 Migration mode: ${effectiveMigrationMode}`);
    console.log(`   authoritative paths: ${authoritativePaths.length > 0 ? authoritativePaths.join(', ') : '(none provided)'}`);
    console.log(`   import extras: ${importExtras.length > 0 ? importExtras.join(', ') : '(none provided)'}`);
    console.log(`   quarantine: ${quarantineMode}`);
    console.log(`   protected paths: ${protectedPaths.length > 0 ? protectedPaths.join(', ') : '(none provided)'}`);
}

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
    console.log(`📥 Loading bootstrap templates...`);
    const bundledPath = path.join(scriptDir, '..', 'references', 'bootstrap-templates.md');
    if (fs.existsSync(bundledPath)) {
        return fs.readFileSync(bundledPath, 'utf8');
    }

    try {
        const response = await fetch(TEMPLATES_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.text();
    } catch (e) {
        console.error("❌ Failed to fetch templates. Make sure you have internet access and the repository is public/accessible.");
        process.exit(1);
    }
}

async function readBundledOrFetch(localRelativePath, remoteUrl, label) {
    const bundledPath = path.join(scriptDir, '..', localRelativePath);
    if (fs.existsSync(bundledPath)) {
        return fs.readFileSync(bundledPath, 'utf8');
    }

    const response = await fetch(remoteUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${label}: HTTP ${response.status}`);
    }
    return await response.text();
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
        content = content.replace(/{MIGRATION_MODE}/g, effectiveMigrationMode);

        // Handle template renaming
        if (filePath.includes('TASK_{DATE}_{ID}_{SLUG}-template.md')) {
            filePath = filePath.replace('TASK_{DATE}_{ID}_{SLUG}-template.md', `TASK_${dateCompact}_0001_bootstrap-vibeagent.md`);
        }

        if (filePath === 'VibeAgent/COMMANDS.yaml') {
            content = renderCommandsYaml();
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
    try {
        const schemasMd = await readBundledOrFetch(path.join('references', 'schemas.md'), SCHEMAS_URL, 'schemas');
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

    try {
        const toolsMd = await readBundledOrFetch(path.join('references', 'validate-js.md'), TOOLS_URL, 'validator tools');

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
        const agentsMdRaw = await readBundledOrFetch(path.join('references', 'agents-md-template.md'), AGENTS_URL, 'AGENTS template');
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
