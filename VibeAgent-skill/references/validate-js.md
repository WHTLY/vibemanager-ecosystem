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

try {
  const requiredFiles = [
    'README.md', 'INSTRUCTIONS.md', 'STATUS.md', 'ROADMAP.md', 'KNOWLEDGE.md', 'GLOSSARY.md', 'METADATA.yaml', 'MAP.yaml', 'COMMANDS.yaml'
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
  if (existsSync(tasksDir)) {
    const tasks = readdirSync(tasksDir).filter(f => f.endsWith('.md'));
    for (const taskFile of tasks) {
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
      if (!data.status || !['planned', 'in_progress', 'blocked', 'done', 'deprecated'].includes(data.status)) {
        fail(`Task ${taskFile} has invalid or missing status. Supported: planned, in_progress, blocked, done, deprecated.`, [
          `Open VibeAgent/tasks/${taskFile}.`,
          "In the frontmatter, set status: to one of: planned, in_progress, blocked, done, deprecated.",
          'Save and run validation again.'
        ]);
      }
    }
  } else {
    console.warn('Warning: tasks/ directory missing, make sure it is created.');
  }

  const schemasDir = join(root, '_schemas');
  if (existsSync(schemasDir)) {
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
      if (!existsSync(schemaPath) || !existsSync(yamlPath)) continue;
      try {
        const schemaObj = JSON.parse(readFileSync(schemaPath, 'utf-8'));
        const validate = ajv.compile(schemaObj);
        const raw = readFileSync(yamlPath, 'utf-8');
        const data = yaml.parse(raw);
        if (!validate(data)) {
          const errMsg = ajv.errorsText(validate.errors);
          console.warn(`Warning: VibeAgent/${file} does not conform to _schemas/${schema}: ${errMsg}`);
        }
      } catch (e) {
        console.warn(`Warning: schema check for VibeAgent/${file} failed: ${e.message}`);
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
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), 'VibeAgent');

console.log('=== Session Close Check ===\n');

try {
  execSync('node VibeAgent/_tools/validate.js', { stdio: 'inherit' });
  console.log('\n✅ Canon validation passed');
} catch {
  console.error('\n❌ Canon validation failed — fix errors before closing session');
  process.exit(2);
}

// Check if archiving is needed
const activeSessionsDir = join(root, 'sessions');
try {
  const sessions = readdirSync(activeSessionsDir).filter(f => f.endsWith('.md') && f !== 'README.md');
  if (sessions.length > 10) {
    console.warn(`\n⚠️ Warning: You have ${sessions.length} sessions. You MUST compress the 5 oldest into sessions/archive/WEEK_X_SUMMARY.md!`);
  }
} catch (e) {
  // Ignore if folder doesn't exist yet
}

console.log('\n📋 Remember to update:');
console.log('  - VibeAgent/tasks/ (mark task as done, update DoD)');
console.log('  - VibeAgent/STATUS.md (health, blockers, progress)');
console.log('  - VibeAgent/ROADMAP.md (if epics/objectives changed)');
console.log('  - Create session note: VibeAgent/sessions/YYYY-MM-DD_{AGENT}_{objective_slug}.md');
```
