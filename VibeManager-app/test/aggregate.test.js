import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import assert from 'node:assert';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const appRoot = join(__dirname, '..');
const fixtureRoot = join(appRoot, 'test', 'fixtures');

describe('aggregate', () => {
  it('produces aggregated.json and WORKSPACE_SUMMARY.md from fixture', () => {
    const out = spawnSync('node', ['src/aggregate.js'], {
      cwd: appRoot,
      env: { ...process.env, AGGREGATE_ROOT: fixtureRoot },
      encoding: 'utf8',
    });
    assert.strictEqual(out.status, 0, out.stderr || out.stdout);

    const jsonPath = join(fixtureRoot, 'data/aggregated.json');
    const mdPath = join(fixtureRoot, 'WORKSPACE_SUMMARY.md');
    assert.ok(existsSync(jsonPath), 'aggregated.json should exist');
    assert.ok(existsSync(mdPath), 'WORKSPACE_SUMMARY.md should exist');

    const data = JSON.parse(readFileSync(jsonPath, 'utf8'));
    assert.ok(Array.isArray(data.projects), 'projects array');
    assert.ok(typeof data.lastUpdated === 'string', 'lastUpdated');
    assert.strictEqual(data.projects.length, 1);
    const p = data.projects[0];
    assert.strictEqual(p.id, 'FAKE-001');
    assert.strictEqual(p.name, 'Fake Project');
    assert.strictEqual(p.department, 'Engineering');
    assert.strictEqual(p.health, 'GREEN');
    assert.strictEqual(p.next, 'Ship the feature.');
    assert.strictEqual(p.blockers.length, 1);
    assert.strictEqual(p.blockers[0].title, 'Blocked task');

    const md = readFileSync(mdPath, 'utf8');
    assert.ok(md.includes('Fake Project'), 'MD has project name');
    assert.ok(md.includes('GREEN'), 'MD has health');
    assert.ok(md.includes('Blocked task'), 'MD has blocker');
  });
});
