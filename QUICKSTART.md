# Quick Start Guide

## Installation (2 minutes)

```bash
# Clone the repository
git clone https://github.com/J-MaFf/mac-space-cleaner.git
cd mac-space-cleaner

# Install dependencies
npm install

# Build TypeScript
npm run build
```

## First Run (1 minute)

```bash
# Scan your Mac and see suggestions
npm start

# Output shows:
# - Total files scanned
# - Total disk space analyzed
# - Files by category (trash, caches, large files, etc.)
# - Top suggestions ranked by deletion safety
```

## Common Commands (Copy & Paste)

### 👀 Preview without risk
```bash
# See what would be deleted (safe preview)
npm start -- --only-category=trash --dry-run
```

### 🗑️ Delete specific categories
```bash
# Delete trash files with confirmation
npm start -- --only-category=trash --interactive

# Delete old downloads (60+ days) with confirmation
npm start -- --only-category=old-download --days=60 --interactive

# Delete caches (requires explicit confirmation)
npm start -- --only-category=cache --confirm-delete
```

### 📊 Scan specific folders
```bash
# Just scan Downloads
npm start -- --paths=/Users/$USER/Downloads

# Scan multiple folders
npm start -- --paths=/Users/$USER/Downloads,/Users/$USER/Library/Caches
```

### 🎯 Custom thresholds
```bash
# Large files over 50 MB
npm start -- --sizeMB=50

# Files not accessed in 90 days
npm start -- --days=90

# Exclude patterns
npm start -- --exclude-patterns=node_modules,.git,dist
```

### 📋 Machine-readable output
```bash
# Get JSON for scripting
npm start -- --json > results.json

# Pretty-print JSON
npm start -- --json | jq '.'

# Count suggestions
npm start -- --json | jq '.suggestions | length'
```

## Safety Tips

⚠️ **Always follow this order**:

1. **First time?** Just scan:
   ```bash
   npm start
   ```

2. **Want to delete?** Preview first:
   ```bash
   npm start -- --dry-run --only-category=trash
   ```

3. **Ready to delete?** Get confirmation:
   ```bash
   npm start -- --only-category=trash --interactive
   ```

4. **Check the log**:
   ```bash
   cat ~/.mac-space-cleaner/deletions-*.log
   ```

## What Gets Scanned?

Default scan paths:
- `~/Downloads` - Old downloaded files
- `~/Library/Caches` - App caches
- `~/Library/Logs` - Log files
- `~/Library/Developer/Xcode/DerivedData` - Xcode build artifacts
- `~/.npm` - npm cache
- `~/.cache/yarn` - Yarn cache
- `~/.Trash` - Deleted files

## Categories

| Category | Default Score | Example |
|----------|--------|---------|
| **trash** | 0.95 | Files in Trash |
| **cache** | 0.90 | App caches, browser caches |
| **logs** | 0.85 | System and app log files |
| **xcode-deriveddata** | 0.90 | Build artifacts |
| **npm-cache** | 0.90 | npm package cache |
| **homebrew-cache** | 0.90 | Homebrew downloads |
| **old-download** | 0.60 | Files 30+ days old |
| **large** | 0.60 | Files >100 MB |

Higher score = safer to delete

## Flags at a Glance

```
SCANNING:
  --sizeMB=N          Size threshold in MB (default: 100)
  --days=N            Age threshold in days (default: 30)
  --paths=P1,P2       Custom paths to scan
  --maxDepth=N        Directory recursion limit (default: 4)
  --maxFiles=N        Total files scanned limit (default: 20000)

FILTERING:
  --only-category=X   Only suggestions for category X
  --exclude-patterns  Skip paths matching patterns

DELETION:
  --dry-run           Preview without deleting
  --confirm-delete    Delete without prompting
  --interactive       Prompt for confirmation (default)

OUTPUT:
  --json              Machine-readable JSON format
```

## Troubleshooting

**"No files found"**
- Try lower thresholds: `--sizeMB=10 --days=7`
- Check paths exist: `--paths=/Users/$USER/Downloads`

**"Permission denied"**
- Some files may be protected (normal)
- Continue with: `sudo npm start -- --confirm-delete`

**"Too slow"**
- Reduce scope: `--paths=/specific/path`
- Lower depth: `--maxDepth=2`

**Need help?**
- Read [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Check [README.md](README.md) for detailed docs

## Development

```bash
npm run build              # Compile TypeScript
npm test                   # Run unit tests
npm run test:coverage      # Generate coverage report
npm run test:watch        # Watch mode for development
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for full setup guide.

---

**Pro tip**: Start small! First run on Downloads only, then gradually expand to other directories.

```bash
# Safe first run
npm start -- --paths=/Users/$USER/Downloads --dry-run
```

Happy cleaning! 🎉
