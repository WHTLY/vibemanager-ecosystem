import { readFileSync, existsSync } from 'node:fs';
import { copySync } from 'fs-extra/esm';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const configPath = join(process.cwd(), 'repositories.json');
const dataDir = join(process.cwd(), 'data/projects');

if (!existsSync(configPath)) {
  console.error("repositories.json not found!");
  process.exit(1);
}

const config = JSON.parse(readFileSync(configPath, 'utf8'));

const GIT_URL_RE = /^(https?:\/\/[^\s]+|git@[^\s]+|ssh:\/\/[^\s]+)$/i;
function isAllowedGitUrl(url) {
  return typeof url === 'string' && GIT_URL_RE.test(url.trim()) && url.length < 4096;
}

console.log("Starting sync sequence for VibeManager...");

for (const repo of config.repositories) {
  console.log(`\nSyncing project: ${repo.name} (${repo.id})`);
  const destPath = join(dataDir, repo.id);
  
  if (repo.url) {
     if (!isAllowedGitUrl(repo.url)) {
       console.error(`Invalid or unsafe git URL for ${repo.id}; skipping.`);
       continue;
     }
     const url = repo.url.trim();
     try {
       if (existsSync(destPath)) {
         console.info(`Pulling latest changes in ${destPath}...`);
         execFileSync('git', ['pull'], { cwd: destPath, stdio: 'inherit' });
       } else {
         console.info(`Cloning repository into ${destPath}...`);
         execFileSync('git', ['clone', url, destPath], { stdio: 'inherit' });
       }
     } catch (e) {
       console.error(`Failed to sync remote repo ${repo.id}: `, e.message);
     }
  } else if (repo.path) {
     // Scenario: Local path (useful for testing initially without remote git setups)
     // We will just copy the `VibeAgent` directory locally. No expensive git operations required.
     try {
       console.info(`Copying from local path ${repo.path}...`);
       const agentDirSrc = join(repo.path, 'VibeAgent');
       const agentDirDest = join(destPath, 'VibeAgent');
       
       if (existsSync(agentDirSrc)) {
         copySync(agentDirSrc, agentDirDest, { overwrite: true });
         console.log(`Synced VibeAgent folder for ${repo.id}`);
       } else {
         console.warn(`No VibeAgent folder found in local path ${repo.path}`);
       }
     } catch (e) {
       console.error(`Failed to copy local path ${repo.path}: `, e.message);
     }
  }
}

console.log("\n✅ Sync sequence complete.");
