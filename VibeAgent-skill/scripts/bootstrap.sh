#!/bin/bash
# VibeAgent Bootstrap — creates the VibeAgent/ directory structure
# Usage: bash VibeAgent/scripts/bootstrap.sh "Project Name" "Project ID" "Department"

set -e

PROJECT_NAME="${1:-My Project}"
PROJECT_ID="${2:-PROJ-001}"
DEPARTMENT="${3:-Engineering}"

DATE=$(date +%Y-%m-%d)
DATE_COMPACT=$(date +%Y_%m_%d)
AGENT="bootstrap"

DIR="VibeAgent"

echo "🚀 Bootstrapping VibeAgent Canon for: $PROJECT_NAME ($PROJECT_ID)"

# Create directories including the new tasks/ and sessions/archive/
mkdir -p "$DIR"/{tasks,specs/mvp,decisions,sessions/archive,research,userprompts,quarantine,_tools,_schemas}

echo "✅ Directory structure created"

# Add an optional git pre-commit hook instruction
if [ -d ".git" ]; then
  echo ""
  echo "💡 Recommended: Set up Git pre-commit hook for VibeAgent validation"
  echo "Run this to protect your canon: echo 'node VibeAgent/_tools/validate.js' > .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit"
fi

echo ""
echo "Next steps:"
echo "  1. Generate file templates using the skill's bootstrap-templates.md reference"
echo "  2. Create AGENTS.md at project root"
echo "  3. Construct METADATA.yaml using args: $PROJECT_NAME, $PROJECT_ID, $DEPARTMENT"
echo "  4. Handle explicit onboarding (move old docs to quarantine/)"
echo "  5. Run: node VibeAgent/_tools/validate.js"
