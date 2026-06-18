# CLAUDE.md — Mac Space Cleaner

Project-specific instructions and conventions for Claude Code.

## Project Overview

Mac Space Cleaner is a TypeScript/Node.js CLI utility that scans macOS systems to identify and suggest files for deletion based on size, age, and type. It is **read-only by default** — it never modifies or deletes files without explicit user confirmation.

## Architecture

```
src/
├── main.ts          # CLI entry point (argument parsing, orchestration)
├── scanner.ts       # FileInfo discovery via recursive directory walk
├── analyzer.ts      # Categorization, scoring, and report generation
├── types/
│   └── index.ts     # Shared type definitions
└── utils/
    └── fileUtils.ts # File utility helpers
```

## Code Conventions

- **Language**: TypeScript with strict mode enabled
- **Modules**: ES6 imports/exports
- **Async**: `async/await` for all I/O
- **Naming**: camelCase for variables/methods, PascalCase for classes/types
- **Error handling**: `try/catch`; log errors to `console.error()` and continue
- **Comments**: Only for non-obvious logic; no redundant JSDoc on self-explanatory methods

## Critical Design Rules

1. **Never delete files** without an explicit `--confirm-delete` flag and interactive confirmation.
2. **Read-only by default** — Scanner only reads metadata (`lstatSync`), never writes.
3. **Graceful degradation** — Handle `ENOENT` and `EACCES` silently; keep scanning.
4. **Cap recursion** — Respect `maxDepth` and `maxFiles` to avoid memory/time issues.

## Build & Run

```bash
npm install       # Install dependencies
npm run build     # Compile TypeScript → dist/
npm start         # Run via ts-node
npm test          # Run test suite
```

## PR Safety Checklist

- No file deletions without explicit `--confirm-delete` or interactive prompt
- New categories detected and aggregated correctly
- CLI flags documented in README.md
- Error handling for permission and missing-file scenarios
- Type definitions aligned with implementation

<!-- git-policies appended below by CI -->
