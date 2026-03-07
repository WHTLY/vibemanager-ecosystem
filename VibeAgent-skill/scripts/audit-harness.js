#!/usr/bin/env node
import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const maxDepth = Number(process.env.VIBEAGENT_AUDIT_MAX_DEPTH || 5);
const asJson = process.argv.includes('--json');

const ignoreDirs = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  '.next',
  'coverage',
  'target',
  'vendor',
  '.turbo',
  '.idea',
  '.vscode',
]);

const categories = [
  {
    id: 'existing_vibeagent',
    title: 'Existing VibeAgent Canon',
    destination: 'Upgrade or migrate the current VibeAgent in place',
    stopTraversal: true,
    match(rel) {
      return rel === 'VibeAgent';
    },
  },
  {
    id: 'governance_rules',
    title: 'Governance / Harness Rules',
    destination: 'AGENTS.md, INSTRUCTIONS.md, KNOWLEDGE.md, or LESSONS.md',
    stopTraversal: true,
    match(rel, name) {
      const lower = rel.toLowerCase();
      const exact = new Set([
        'AGENTS.md',
        '.cursorrules',
        '.clinerules',
        'CLAUDE.md',
        'GEMINI.md',
        'COPILOT.md',
        'RULES.md',
      ]);
      return exact.has(name) ||
        lower === '.github/copilot-instructions.md' ||
        lower === '.cursor/rules' ||
        lower === '.cursor/rules.md';
    },
  },
  {
    id: 'tasks_and_roadmaps',
    title: 'Tasks / Roadmaps / Planning',
    destination: 'VibeAgent/tasks/ and VibeAgent/ROADMAP.md',
    match(rel, name) {
      const lower = name.toLowerCase();
      return lower.startsWith('todo') ||
        lower.includes('backlog') ||
        lower.includes('roadmap') ||
        lower === 'plan.md' ||
        lower === 'plans.md' ||
        lower === 'tasks.md' ||
        lower === 'tasklist.md';
    },
  },
  {
    id: 'prompts',
    title: 'Prompt Libraries',
    destination: 'VibeAgent/userprompts/',
    stopTraversal: true,
    match(rel, name, isDir) {
      const lower = rel.toLowerCase();
      return lower.includes('prompt') ||
        lower.includes('prompts') ||
        (isDir && (name.toLowerCase() === 'promptlib' || name.toLowerCase() === 'prompts'));
    },
  },
  {
    id: 'commands_and_runbooks',
    title: 'Commands / Runbooks',
    destination: 'VibeAgent/COMMANDS.yaml',
    stopTraversal: true,
    match(rel, name) {
      const lower = rel.toLowerCase();
      return lower.includes('runbook') ||
        lower.includes('commands') ||
        lower.includes('playbook') ||
        name.toLowerCase() === 'ops.md';
    },
  },
  {
    id: 'research_and_architecture',
    title: 'Research / Architecture',
    destination: 'VibeAgent/ARCHITECTURE.md, MAP.yaml, research/, decisions/',
    stopTraversal: true,
    match(rel, name) {
      const lower = rel.toLowerCase();
      return lower.includes('architecture') ||
        lower.includes('adr') ||
        lower.includes('decision') ||
        lower.includes('knowledge') ||
        lower.includes('research') ||
        lower.includes('design-doc');
    },
  },
  {
    id: 'sessions_and_logs',
    title: 'Sessions / Logs / Journals',
    destination: 'VibeAgent/sessions/ or sessions/archive/',
    stopTraversal: true,
    match(rel, name) {
      const lower = rel.toLowerCase();
      return lower.includes('session') ||
        lower.includes('handoff') ||
        lower.includes('journal') ||
        lower.includes('worklog') ||
        lower.includes('standup');
    },
  },
];

const findings = Object.fromEntries(categories.map((category) => [category.id, []]));

function classify(rel, name, isDir) {
  for (const category of categories) {
    if (category.match(rel, name, isDir)) {
      return category;
    }
  }
  return null;
}

function walk(dir, depth = 0) {
  if (depth > maxDepth) return;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoreDirs.has(entry.name)) continue;

    const fullPath = join(dir, entry.name);
    const relPath = relative(root, fullPath) || entry.name;
    const category = classify(relPath, entry.name, entry.isDirectory());

    if (category) {
      findings[category.id].push(relPath);
    }

    if (entry.isDirectory() && !(category && category.stopTraversal)) {
      walk(fullPath, depth + 1);
    }
  }
}

walk(root);

for (const category of categories) {
  findings[category.id] = [...new Set(findings[category.id])].sort();
}

const questionnaire = [
  'Should VibeAgent replace the current harness immediately, run in shadow mode, or be introduced in phases?',
  'Which existing files or directories are still authoritative and must remain active during migration?',
  'Which categories should be imported as extras if found: prompts, commands, rules, research notes, architecture docs, session history, open tasks?',
  'Should legacy artifacts be quarantined immediately after import, or kept in place until the new canon is validated?',
  'Are there any files or directories the agent must not move, rewrite, or absorb automatically?',
];

const nextSteps = [
  'Summarize detected artifacts to the user before editing files.',
  'Ask the pre-migration questionnaire and pick a migration mode: replace, shadow, or phased.',
  'Import useful extras into canonical VibeAgent destinations instead of copying legacy structure verbatim.',
  'Quarantine superseded artifacts and record both the source and the new destination in quarantine/REGISTRY.md.',
];

if (asJson) {
  console.log(JSON.stringify({
    project_root: root,
    findings: categories
      .map((category) => ({
        id: category.id,
        title: category.title,
        destination: category.destination,
        items: findings[category.id],
      }))
      .filter((category) => category.items.length > 0),
    questionnaire,
    next_steps: nextSteps,
  }, null, 2));
  process.exit(0);
}

console.log('# VibeAgent Migration Audit');
console.log('');
console.log(`Project root: ${root}`);
console.log('');

let detectedCount = 0;
for (const category of categories) {
  const items = findings[category.id];
  if (items.length === 0) continue;
  detectedCount += items.length;
  console.log(`## ${category.title}`);
  console.log(`Recommended destination: ${category.destination}`);
  for (const item of items) {
    console.log(`- ${item}`);
  }
  console.log('');
}

if (detectedCount === 0) {
  console.log('No obvious governance artifacts detected from the built-in heuristics.');
  console.log('This does not prove the repo is greenfield. Manually inspect unusual internal docs before bootstrapping.');
  console.log('');
}

console.log('## Pre-Migration Questionnaire');
questionnaire.forEach((question, index) => {
  console.log(`${index + 1}. ${question}`);
});
console.log('');

console.log('## Recommended Next Steps');
nextSteps.forEach((step, index) => {
  console.log(`${index + 1}. ${step}`);
});
