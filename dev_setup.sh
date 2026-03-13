#!/bin/bash
# dev_setup.sh - Setup script for AldeiasGames development

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up AldeiasGames development environment...${NC}"

# Check if we're in the project directory
if [[ ! -f "prisma/schema.prisma" ]]; then
    echo -e "${RED}Error: Please run this script from the project root${NC}"
    exit 1
fi

# Load environment variables if .env.local exists
if [[ -f ".env.local" ]]; then
    echo -e "${GREEN}Loading environment variables from .env.local${NC}"
    export $(grep -v '^#' .env.local | xargs)
fi

# Check for GITHUB_TOKEN
if [[ -z "${GITHUB_TOKEN:-}" ]]; then
    echo -e "${YELLOW}Warning: GITHUB_TOKEN environment variable not set${NC}"
    echo -e "To use GitHub API features, set your token:"
    echo -e "  export GITHUB_TOKEN='your_github_token_here'"
    echo -e "Or add it to .env.local:"
    echo -e "  GITHUB_TOKEN=your_github_token_here"
else
    echo -e "${GREEN}GITHUB_TOKEN found (length: ${#GITHUB_TOKEN})${NC}"
    # Basic validation - GitHub tokens start with ghp_ or gh[ou]_
    if [[ ! $GITHUB_TOKEN =~ ^gh[pou]_[a-zA-Z0-9]{36,}$ ]]; then
        echo -e "${YELLOW}Warning: Token format doesn't match expected GitHub token pattern${NC}"
    fi
fi

# Check for Node.js and npm
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js not found. Please install Node.js >=18${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm not found. Please install npm${NC}"
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}Installing npm dependencies...${NC}"
npm install

# Install Python dependencies if needed
if [[ -f "requirements.txt" ]]; then
    echo -e "${YELLOW}Installing Python dependencies...${NC}"
    pip install -r requirements.txt
fi

# Initialize Prisma
echo -e "${YELLOW}Initializing Prisma...${NC}"
npx prisma generate

# Check if database needs to be migrated
if [[ ! -f "dev.db" ]]; then
    echo -e "${YELLOW}Creating development database...${NC}"
    npx prisma migrate dev --name init || echo -e "${YELLOW}Migration failed, trying db push...${NC}" && npx prisma db push
else
    echo -e "${GREEN}Database already exists${NC}"
fi

# Create necessary directories
mkdir -p scripts
mkdir -p docs
mkdir -p config
mkdir -p prisma/migrations

echo -e "${GREEN}Setup complete!${NC}"
echo -e ""
echo -e "Next steps:"
echo -e "1. Copy .env.example to .env.local if you haven't already"
echo -e "2. Add your GITHUB_TOKEN to .env.local (or export it)"
echo -e "3. Run './dev_setup.sh' again to validate"
echo -e "4. Start development with 'npm run dev'"
echo -e ""
echo -e "Available scripts:"
echo -e "  npm run dev          - Start development server"
echo -e "  npm run build        - Build for production"
echo -e "  npm run prisma:studio - Open Prisma Studio"
echo -e "  ./scripts/list_repos.py - List your GitHub repositories (requires GITHUB_TOKEN)"