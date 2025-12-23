# Copilot Instructions for Mac Space Cleaner

## Project Overview

Mac Space Cleaner is a TypeScript/Node.js CLI utility that scans macOS systems to identify and suggest files for deletion based on size, age, and type. It analyzes file system metadata and categorizes findings (large files, caches, old downloads, build artifacts, logs, trash) without modifying any files.

## Core Architecture

### Directory Structure
```
src/
├── main.ts          # CLI entry point with argument parsing
├── scanner.ts       # FileInfo discovery via recursive directory walk
├── analyzer.ts      # Categorization and suggestion scoring
├── types/
│   └── index.ts     # Type definitions (FileInfo, Category, Suggestion, AnalysisResult)
└── utils/
    └── fileUtils.ts # (Legacy) Utility helpers for file operations
```

### Key Modules

**Scanner** (`src/scanner.ts`)
- Recursively walks directories and collects file metadata (`path`, `name`, `size`, `mtime`, `atime`)
- Default scan paths: `~/Downloads`, `~/Library/Caches`, `~/Library/Logs`, `~/Library/Developer/Xcode/DerivedData`, `~/.npm`, `~/.cache/yarn`, `~/.Trash`, Homebrew cache
- Respects `maxDepth` and `maxFiles` caps for safety
- Returns `FileInfo[]`

**Analyzer** (`src/analyzer.ts`)
- Categorizes files via path pattern matching (e.g., `.includes('/.trash/')` → `trash`)
- Scores suggestions based on category and heuristics (trash=0.95, cache=0.9, large files by size)
- Aggregates by category with count and total size
- Generates human-readable reports or JSON export
- Returns `AnalysisResult` with categorized suggestions

**Types** (`src/types/index.ts`)
- **Category**: `'large' | 'old-download' | 'cache' | 'logs' | 'xcode-deriveddata' | 'homebrew-cache' | 'npm-cache' | 'yarn-cache' | 'trash' | 'other'`
- **FileInfo**: `{ path, name, size, mtime, atime?, category? }`
- **Suggestion**: `{ file, category, reason, score }`
- **AnalysisResult**: `{ totalFiles, totalSize, suggestions, byCategory, report }`

**Main** (`src/main.ts`)
- Parses CLI flags: `--json`, `--sizeMB`, `--days`, `--paths`, `--maxDepth`, `--maxFiles`
- Chains Scanner → Analyzer → output (text or JSON)

## Code Style & Conventions

- **Language**: TypeScript with strict mode enabled
- **Modules**: Use ES6 imports/exports (`import X from '...'`, `export class X {}`)
- **Async**: Use `async/await` for I/O operations
- **Error Handling**: Use try/catch; log errors to `console.error()`
- **Naming**: camelCase for variables/methods, PascalCase for classes
- **Comments**: Inline comments for non-obvious logic; JSDoc for public methods
- **No Deletion**: Never delete files without explicit user confirmation and a `--confirm` flag

## Key Design Constraints

1. **Safety First**: Read-only by default. Suggest only; never modify files.
2. **Respect User Choices**: Always provide a review/confirmation step before any action.
3. **Configurable Heuristics**: Allow customization of size/age thresholds via CLI flags.
4. **Graceful Degradation**: Handle permission errors, symlinks, and missing paths silently (continue scanning).
5. **Performance**: Cap recursion depth and total files to avoid memory/time issues.

## How to Extend

### Adding a New Category
1. Add category name to `Category` type in `src/types/index.ts`
2. Add aggregation entry in `Analyzer.analyze()` → `byCategory` map
3. Add detection logic in `Analyzer.detectCategory()` with a path pattern
4. (Optional) Add scoring heuristic for suggestions

### Adding New CLI Flags
1. Parse in `parseArgs()` function in `src/main.ts`
2. Pass option to `Scanner` or `Analyzer` constructor
3. Update README.md with flag description and example
4. Document in `.copilot-instructions.md`

### Adding Commands (e.g., `--delete`, `--estimate`)
1. Add flag parsing logic in `main.ts`
2. Implement feature in `analyzer.ts` or create a new module (e.g., `deleter.ts`)
3. Ensure all deletion paths require explicit confirmation
4. Update README with safety disclaimers

## File Operations Guidelines

- Use `fs` (filesystem) for reading metadata only; use `fs.promises` for async operations
- Use `fs.lstatSync()` by default (don't follow symlinks) unless `followSymlinks` option is set
- Handle `ENOENT` (file not found) and `EACCES` (permission denied) gracefully
- Log file operation errors to `console.error()` but continue scanning

## Testing Strategy

- Write unit tests in `__tests__/` or `*.test.ts` files (not yet implemented; suggested for future)
- Mock `fs` module for scanner tests
- Use sample file structures for analyzer tests
- Test edge cases: empty directories, permission errors, circular symlinks, very large files

## Common Tasks

**Scenario: User reports large node_modules folder is included in suggestions**
- Add a pattern for `node_modules` in `detectCategory()` or create a new `'dev-build'` category
- Optionally add filtering flag like `--exclude-patterns` to skip paths

**Scenario: Add support for scanning external drives**
- Extend default scan paths to accept mounted volumes
- Add `--drives` CLI flag to auto-discover and include external volumes
- Ensure symlinks to drives are respected

**Scenario: Add deletion capability**
- Create `src/deleter.ts` with `Deleter` class
- Require `--confirm-delete` or interactive prompt
- Implement dry-run mode (`--dry-run`) to preview deletions
- Log all deletions to a file (e.g., `~/.mac-space-cleaner/deletions.log`)

## Dependencies

- **typescript**: Language and compiler
- **ts-node**: Run TypeScript directly
- **@types/node**: Node.js type definitions
- **jest** (optional): Testing framework (not yet configured)

## Build & Run

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript → dist/
npm start            # Run via ts-node
npm start -- --json  # Run with JSON output
```

## Safety Checklist for PRs

- [ ] No file deletions without explicit `--confirm-delete` or interactive prompt
- [ ] New categories properly detected and aggregated
- [ ] CLI flags documented in README.md
- [ ] Error handling for permission and missing-file scenarios
- [ ] Type definitions align with implementation
- [ ] Large files / recursion capped to prevent memory/performance issues
