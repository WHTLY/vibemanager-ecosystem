#!/bin/bash
# VibeAgent 1-Click Installer
# Usage: curl -sSL https://raw.githubusercontent.com/WHTLY/vibemanager-ecosystem/main/VibeAgent-skill/scripts/install.sh | bash -s "Project Name" "PROJ-123" "Engineering"

PROJECT_NAME="${1:-My Project}"
PROJECT_ID="${2:-PROJ-001}"
DEPARTMENT="${3:-Engineering}"

cleanup() { rm -f /tmp/auto-bootstrap.js; }
trap cleanup EXIT

echo "Downloading VibeAgent auto-bootstrap script..."

curl -sSL https://raw.githubusercontent.com/WHTLY/vibemanager-ecosystem/main/VibeAgent-skill/scripts/auto-bootstrap.js > /tmp/auto-bootstrap.js

echo "Running node script..."
node /tmp/auto-bootstrap.js "$PROJECT_NAME" "$PROJECT_ID" "$DEPARTMENT"

echo "Installation finished. Enjoy the Vibes."
