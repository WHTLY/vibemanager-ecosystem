# VibeAgent Validator (validate.js)

Place this file at `VibeAgent/_tools/validate.js`. It validates the entire canon structure:
required files, YAML schemas (when _schemas/ exists), and task frontmatter.

Exit codes: `0` (valid), `2` (validation failed), `3` (runtime error).

## validate.js

```javascript
#!/usr/bin/env node
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'yaml';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const root = join(process.cwd(), 'VibeAgent');
const TASK_STATUSES = new Set(['planned', 'in_progress', 'blocked', 'done', 'deprecated']);
const TASK_PRIORITIES = new Set(['P0', 'P1', 'P2', 'P3']);
const DATE_RE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
const TASK_FILENAME_RE = /^TASK_[0-9]{4}_[0-9]{2}_[0-9]{2}_[0-9]{4}_[a-z0-9][a-z0-9_-]*\.md$/;

function fail(msg, remediation) {
  console.error('ERROR: ' + msg);
  if (remediation) {
    console.error('REMEDIATION FOR AI AGENT:');
    remediation.forEach((step, i) => console.error(`${i + 1}. ${step}`));
  }
  process.exit(2);
}

function runtimeError(msg, remediation) {
  console.error('ERROR (runtime): ' + msg);
  if (remediation) {
    console.error('REMEDIATION FOR AI AGENT:');
    remediation.forEach((step, i) => console.error(`${i + 1}. ${step}`));
  }
  process.exit(3);
}

function ensure(condition, msg, remediation) {
  if (!condition) {
    fail(msg, remediation);
  }
}

function getSectionBody(markdown, heading) {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const headingMatch = markdown.match(new RegExp(`^## ${escapedHeading}\\b.*$`, 'm'));
  if (!headingMatch || typeof headingMatch.index !== 'number') {
    return '';
  }

  const start = headingMatch.index + headingMatch[0].length;
  const rest = markdown.slice(start);
  const nextHeading = rest.search(/\n## |\n# /);
  const body = nextHeading === -1 ? rest : rest.slice(0, nextHeading);
  return body.trim();
}

try {
  const requiredFiles = [
    'README.md',
    'INSTRUCTIONS.md',
    'STATUS.md',
    'ROADMAP.md',
    'KNOWLEDGE.md',
    'GLOSSARY.md',
    'ARCHITECTURE.md',
    'PRODUCT_CONTRACT.md',
    'STREAMS.md',
    'RISKS.md',
    'LESSONS.md',
    'METADATA.yaml',
    'MAP.yaml',
    'COMMANDS.yaml',
    'research/README.md',
    'research/INDEX.yaml',
    'userprompts/README.md',
    'userprompts/INDEX.yaml',
    'quarantine/REGISTRY.md',
    'sessions/README.md',
    '_tools/close-session.js',
    '_schemas/metadata.schema.json',
    '_schemas/map.schema.json',
    '_schemas/commands.schema.json',
    '_schemas/prompts.schema.json',
    '_schemas/research.schema.json'
  ];
  for (const file of requiredFiles) {
    if (!existsSync(join(root, file))) {
      fail(`Missing required file: VibeAgent/${file}`, [
        `Create VibeAgent/${file} or run bootstrap again.`,
        `See references/bootstrap-templates.md for the template (section ## VibeAgent/${file}).`
      ]);
    }
  }

  const statusPath = join(root, 'STATUS.md');
  const statusContent = readFileSync(statusPath, 'utf-8');
  if (!/- Overall:\s+(GREEN|YELLOW|RED)/.test(statusContent)) {
    fail('STATUS.md must have Health - Overall: strictly set to GREEN, YELLOW, or RED.', [
      'Open VibeAgent/STATUS.md.',
      "In the ## Health section, add a line: '- Overall: GREEN' (or YELLOW or RED).",
      'Save the file and run validation again.'
    ]);
  }

  const tasksDir = join(root, 'tasks');
  ensure(existsSync(tasksDir), 'Missing required directory: VibeAgent/tasks/', [
    'Create the VibeAgent/tasks/ directory or run bootstrap again.',
    'Ensure at least one task file exists to track active work.'
  ]);
  const tasks = readdirSync(tasksDir).filter(f => f.endsWith('.md'));
  for (const taskFile of tasks) {
    ensure(TASK_FILENAME_RE.test(taskFile), `Task filename ${taskFile} does not match TASK_YYYY_MM_DD_NNNN_slug.md.`, [
      `Rename VibeAgent/tasks/${taskFile} to the canonical format.`,
      'Use lowercase slug text and keep the numeric sequence 4 digits long.'
    ]);

    const content = readFileSync(join(tasksDir, taskFile), 'utf-8');
    if (!content.startsWith('---')) {
      fail(`Task file ${taskFile} must have YAML frontmatter.`, [
        `Open VibeAgent/tasks/${taskFile}.`,
        'Ensure the file starts with ---, then YAML key: value, then ---.',
        'See references/bootstrap-templates.md for the task template.'
      ]);
    }
    const frontmatterMatch = content.match(/---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      fail(`Missing or broken YAML frontmatter in task ${taskFile}.`, [
        `Open VibeAgent/tasks/${taskFile}.`,
        'Ensure there is a closing --- after the YAML block.',
        'Fix any invalid YAML (indentation, quotes).'
      ]);
    }
    let data;
    try {
      data = yaml.parse(frontmatterMatch[1]);
    } catch (e) {
      fail(`Invalid YAML in task ${taskFile}: ${e.message}`, [
        `Open VibeAgent/tasks/${taskFile}.`,
        'Fix the YAML syntax in the frontmatter (between the --- lines).',
        'Check indentation and special characters.'
      ]);
    }

    ensure(typeof data.id === 'string' && /^TASK_[0-9]{4}_[0-9]{2}_[0-9]{2}_[0-9]{4}$/.test(data.id), `Task ${taskFile} has invalid or missing id.`, [
      `Open VibeAgent/tasks/${taskFile}.`,
      'Set id: to TASK_YYYY_MM_DD_NNNN format.',
      'Use the same date/sequence convention as the filename.'
    ]);
    ensure(typeof data.title === 'string' && data.title.trim().length > 0, `Task ${taskFile} has invalid or missing title.`, [
      `Open VibeAgent/tasks/${taskFile}.`,
      'Add a non-empty title: field to the frontmatter.'
    ]);
    ensure(TASK_STATUSES.has(data.status), `Task ${taskFile} has invalid or missing status. Supported: planned, in_progress, blocked, done, deprecated.`, [
      `Open VibeAgent/tasks/${taskFile}.`,
      'Set status: to one of planned, in_progress, blocked, done, deprecated.'
    ]);
    ensure(TASK_PRIORITIES.has(data.priority), `Task ${taskFile} has invalid or missing priority. Supported: P0, P1, P2, P3.`, [
      `Open VibeAgent/tasks/${taskFile}.`,
      'Set priority: to one of P0, P1, P2, P3.'
    ]);
    ensure(typeof data.owner === 'string' && data.owner.trim().length > 0, `Task ${taskFile} has invalid or missing owner.`, [
      `Open VibeAgent/tasks/${taskFile}.`,
      'Set owner: to the current responsible agent or person.'
    ]);
    ensure(typeof data.created_at === 'string' && DATE_RE.test(data.created_at), `Task ${taskFile} has invalid or missing created_at.`, [
      `Open VibeAgent/tasks/${taskFile}.`,
      'Set created_at: to YYYY-MM-DD.'
    ]);
    ensure(typeof data.updated_at === 'string' && DATE_RE.test(data.updated_at), `Task ${taskFile} has invalid or missing updated_at.`, [
      `Open VibeAgent/tasks/${taskFile}.`,
      'Set updated_at: to YYYY-MM-DD.'
    ]);

    ensure(/^## Plan\b/m.test(content), `Task ${taskFile} is missing a ## Plan section.`, [
      `Open VibeAgent/tasks/${taskFile}.`,
      'Add a ## Plan section with checkable items for the work.'
    ]);
    ensure(/^## Verification\b/m.test(content), `Task ${taskFile} is missing a ## Verification section.`, [
      `Open VibeAgent/tasks/${taskFile}.`,
      'Add a ## Verification section to record tests, builds, logs, or smoke checks.'
    ]);

    if (data.status === 'done') {
      const verificationBody = getSectionBody(content, 'Verification');
      ensure(verificationBody.length > 0, `Done task ${taskFile} must have non-empty verification evidence.`, [
        `Open VibeAgent/tasks/${taskFile}.`,
        'Under ## Verification, record the concrete proof that the task works.',
        'Examples: targeted test command, build result, smoke check, or log-based confirmation.'
      ]);
    }
  }

  const schemasDir = join(root, '_schemas');
  ensure(existsSync(schemasDir), 'Missing required directory: VibeAgent/_schemas/', [
    'Re-run bootstrap or restore the _schemas/ directory.',
    'Ensure all JSON schema files are present before validating again.'
  ]);
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);
  const schemaFiles = [
    { file: 'METADATA.yaml', schema: 'metadata.schema.json' },
    { file: 'MAP.yaml', schema: 'map.schema.json' },
    { file: 'COMMANDS.yaml', schema: 'commands.schema.json' },
    { file: 'research/INDEX.yaml', schema: 'research.schema.json' },
    { file: 'userprompts/INDEX.yaml', schema: 'prompts.schema.json' }
  ];
  for (const { file, schema } of schemaFiles) {
    const schemaPath = join(schemasDir, schema);
    const yamlPath = join(root, file);
    try {
      const schemaObj = JSON.parse(readFileSync(schemaPath, 'utf-8'));
      const validate = ajv.compile(schemaObj);
      const raw = readFileSync(yamlPath, 'utf-8');
      const data = yaml.parse(raw);
      if (!validate(data)) {
        const errMsg = ajv.errorsText(validate.errors);
        fail(`VibeAgent/${file} does not conform to _schemas/${schema}: ${errMsg}`, [
          `Open VibeAgent/${file}.`,
          `Fix the fields reported by the schema validator for _schemas/${schema}.`,
          'If the file is stale, recreate it from references/bootstrap-templates.md and re-apply project-specific values.'
        ]);
      }
    } catch (e) {
      runtimeError(`Schema check for VibeAgent/${file} failed: ${e.message}`, [
        `Check that VibeAgent/${file} and VibeAgent/_schemas/${schema} are valid and readable.`,
        'If needed, restore them from the skill references and run validation again.'
      ]);
    }
  }

  let commandsPack;
  try {
    commandsPack = yaml.parse(readFileSync(join(root, 'COMMANDS.yaml'), 'utf-8'));
  } catch (e) {
    runtimeError(`Could not parse VibeAgent/COMMANDS.yaml: ${e.message}`, [
      'Open VibeAgent/COMMANDS.yaml.',
      'Fix the YAML syntax or restore the file from bootstrap templates.',
      'Run validation again once the file parses cleanly.'
    ]);
  }

  for (const group of commandsPack?.command_groups || []) {
    for (const command of group?.commands || []) {
      if (command?.required_for_done === true) {
        ensure(typeof command.copy_text === 'string' && command.copy_text.trim().length > 0, `Command ${command.id || '(missing id)'} is marked required_for_done but has no executable copy_text.`, [
          'Open VibeAgent/COMMANDS.yaml.',
          'For each command with required_for_done: true, provide a non-empty copy_text command.',
          'If the command is not yet trustworthy, set required_for_done: false instead.'
        ]);
      }
    }
  }

  console.log('Validation logic initialized successfully. All core assertions passed.');
  process.exit(0);
} catch (e) {
  if (e.code === 'ENOENT' || e.syscall === 'read') {
    runtimeError(e.message || String(e), [
      'Check that VibeAgent/ exists and required files are present.',
      'Run bootstrap again if the canon was not fully created.'
    ]);
  }
  runtimeError(e.message || String(e), [
    'This is an unexpected error. Check file permissions and that yaml/ajv/ajv-formats are installed.',
    'Run: npm install yaml ajv ajv-formats'
  ]);
}
```

### close-session.js

```javascript
#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'yaml';

const root = join(process.cwd(), 'VibeAgent');
const activeSessionsDir = join(root, 'sessions');

function fail(msg, remediation) {
  console.error('\n❌ ' + msg);
  if (remediation) {
    console.error('REMEDIATION FOR AI AGENT:');
    remediation.forEach((step, i) => console.error(`${i + 1}. ${step}`));
  }
  process.exit(2);
}

function loadRequiredCommands() {
  let commandsPack;
  try {
    commandsPack = yaml.parse(readFileSync(join(root, 'COMMANDS.yaml'), 'utf-8'));
  } catch (e) {
    fail(`Could not parse VibeAgent/COMMANDS.yaml: ${e.message}`, [
      'Open VibeAgent/COMMANDS.yaml and fix the YAML syntax.',
      'Restore the file from bootstrap templates if needed.',
      'Run close-session again after fixing the file.'
    ]);
  }

  const requiredCommands = [];
  for (const group of commandsPack?.command_groups || []) {
    for (const command of group?.commands || []) {
      if (command?.required_for_done === true) {
        requiredCommands.push(command);
      }
    }
  }
  return requiredCommands;
}

console.log('=== Session Close Check ===\n');

try {
  execSync('node VibeAgent/_tools/validate.js', { stdio: 'inherit' });
  console.log('\n✅ Canon validation passed');
} catch {
  console.error('\n❌ Canon validation failed — fix errors before closing session');
  process.exit(2);
}

const requiredCommands = loadRequiredCommands();
if (requiredCommands.length === 0) {
  console.log('\nℹ️ No required verification commands configured in COMMANDS.yaml');
} else {
  console.log('\n🧪 Running required verification commands...');
  for (const command of requiredCommands) {
    try {
      console.log(`\n> ${command.title || command.id}`);
      console.log(`$ ${command.copy_text}`);
      execSync(command.copy_text, { stdio: 'inherit' });
    } catch (e) {
      fail(`Required verification command failed: ${command.id || command.title || command.copy_text}`, [
        'Fix the failing command or the underlying code issue it exposed.',
        'If this command should not block session completion, set required_for_done: false in VibeAgent/COMMANDS.yaml.',
        'Run close-session again after the required verification command passes.'
      ]);
    }
  }
  console.log('\n✅ Required verification commands passed');
}

try {
  const sessions = readdirSync(activeSessionsDir).filter(f => f.endsWith('.md') && f !== 'README.md');
  if (sessions.length === 0) {
    fail('Session close requires at least one session note in VibeAgent/sessions/.', [
      'Create a session note named YYYY-MM-DD_{AGENT}_{objective_slug}.md in VibeAgent/sessions/.',
      'Summarize what changed, verification performed, and follow-up work.',
      'Run close-session again after saving the note.'
    ]);
  }
  if (sessions.length > 10) {
    fail(`Session archive required: found ${sessions.length} session notes in VibeAgent/sessions/.`, [
      'Select the 5 oldest session note files.',
      'Compress them into one summary under VibeAgent/sessions/archive/WEEK_X_SUMMARY.md.',
      'Delete or move the archived originals, then run close-session again.'
    ]);
  }
} catch (e) {
  fail(`Could not inspect VibeAgent/sessions/: ${e.message}`, [
    'Ensure VibeAgent/sessions/ exists and is readable.',
    'Restore sessions/README.md and any required session notes, then retry.'
  ]);
}

console.log('\n📋 Remember to update:');
console.log('  - VibeAgent/tasks/ (verification recorded, DoD updated, status correct)');
console.log('  - VibeAgent/LESSONS.md (if corrections or new repeatable lessons emerged)');
console.log('  - VibeAgent/STATUS.md (health, blockers, progress)');
console.log('  - VibeAgent/ROADMAP.md (if epics/objectives changed)');
console.log('  - VibeAgent/sessions/YYYY-MM-DD_{AGENT}_{objective_slug}.md');
```
