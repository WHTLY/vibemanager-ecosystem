import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'yaml';

const dataDir = join(process.cwd(), 'data/projects');
const outputJsonPath = join(process.cwd(), 'data/aggregated.json');
const outputMdPath = join(process.cwd(), 'WORKSPACE_SUMMARY.md');

const aggregated = {
    lastUpdated: new Date().toISOString(),
    projects: []
};

let mdSummary = `# VibeManager Workspace Summary\n\n`;
mdSummary += `*Last Updated: ${aggregated.lastUpdated}*\n\n`;

if (existsSync(dataDir)) {
    const projectDirs = readdirSync(dataDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    for (const dirName of projectDirs) {
        const projectPath = join(dataDir, dirName);
        const vibeAgentPath = join(projectPath, 'VibeAgent');

        if (!existsSync(vibeAgentPath)) {
            continue;
        }

        const projectData = {
            id: dirName,
            name: dirName,
            health: 'UNKNOWN',
            department: 'UNKNOWN',
            tasks: [],
            blockers: [],
            next: '',
            statusText: ''
        };

        // Load METADATA.yaml
        const metadataPath = join(vibeAgentPath, 'METADATA.yaml');
        if (existsSync(metadataPath)) {
            const pack = yaml.parse(readFileSync(metadataPath, 'utf8'));
            if (pack?.project) {
                projectData.id = pack.project.id || dirName;
                projectData.name = pack.project.name || projectData.name;
                projectData.department = pack.project.department || 'UNKNOWN';
            }
        }

        // Load STATUS.md
        const statusPath = join(vibeAgentPath, 'STATUS.md');
        if (existsSync(statusPath)) {
            const statusMd = readFileSync(statusPath, 'utf8');
            projectData.statusText = statusMd;

            const healthMatch = statusMd.match(/- Overall:\s+(GREEN|YELLOW|RED)/);
            if (healthMatch) {
                projectData.health = healthMatch[1];
            }
        }

        // Load ROADMAP.md
        const roadmapPath = join(vibeAgentPath, 'ROADMAP.md');
        if (existsSync(roadmapPath)) {
            const roadmapStr = readFileSync(roadmapPath, 'utf8');
            // Extract the section under ## Immediate Next
            const nextMatch = roadmapStr.match(/## Immediate Next[^\n]*\n([\s\S]*?)(?:\n##|$)/);
            if (nextMatch) {
                projectData.next = nextMatch[1].trim();
            }
        }

        // Load tasks/*.md
        const tasksDir = join(vibeAgentPath, 'tasks');
        if (existsSync(tasksDir)) {
            const taskFiles = readdirSync(tasksDir).filter(f => f.endsWith('.md') && !f.endsWith('-template.md'));
            for (const taskFile of taskFiles) {
                const taskContent = readFileSync(join(tasksDir, taskFile), 'utf8');
                const frontmatterMatch = taskContent.match(/^---\n([\s\S]*?)\n---/);
                if (frontmatterMatch) {
                    try {
                        const taskMeta = yaml.parse(frontmatterMatch[1]);
                        projectData.tasks.push(taskMeta);
                        if (taskMeta.status === 'blocked') {
                            projectData.blockers.push(taskMeta);
                        }
                    } catch (e) {
                        console.error(`Error parsing task YAML in ${taskFile}:`, e);
                    }
                }
            }
        }

        aggregated.projects.push(projectData);

        // Build Markdown block
        mdSummary += `## Project: ${projectData.name} (${projectData.id})\n`;
        mdSummary += `- **Health**: ${projectData.health}\n`;
        mdSummary += `- **Department**: ${projectData.department}\n`;
        mdSummary += `- **Blocked Tasks**: ${projectData.blockers.length}\n`;
        if (projectData.blockers.length > 0) {
            mdSummary += `  - ${projectData.blockers.map(b => b.title).join(', ')}\n`;
        }
        mdSummary += `### Recent Status\n`;
        // limit status length
        const lines = projectData.statusText.split('\n');
        mdSummary += lines.slice(0, 10).join('\n') + (lines.length > 10 ? '\n...\n' : '\n');
        mdSummary += `\n---\n\n`;
    }
}

writeFileSync(outputJsonPath, JSON.stringify(aggregated, null, 2), 'utf8');
writeFileSync(outputMdPath, mdSummary, 'utf8');

console.log(`✅ Aggregation complete.`);
console.log(`JSON written to ${outputJsonPath}`);
console.log(`MD written to ${outputMdPath}`);
