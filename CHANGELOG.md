# Changelog

All notable changes to Mac Space Cleaner will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Filled the `package.json` `author` field and added a GitHub repository
  description ("CLI to scan and free disk space on macOS") so the project is
  identifiable at a glance and discoverable in search
  ([#7](https://github.com/J-MaFf/mac-space-cleaner/issues/7)).

- `--exclude-patterns` now uses minimatch glob matching instead of naive
  substring matching. Patterns are tested against the full path, the basename,
  and each path segment, so `node` no longer wrongly excludes
  `node-installer.dmg` while `node_modules` and globs like `*.dmg` still work
  ([#6](https://github.com/J-MaFf/mac-space-cleaner/issues/6)).

### Fixed

- `~/.Trash` contents are no longer bulk-deleted behind a count-only prompt.
  Before any deletion (including non-interactive `--yes`/`--auto-delete`), the
  actual Trash paths and sizes are now printed — capped at a 20-item sample with
  an "N more" line ([#4](https://github.com/J-MaFf/mac-space-cleaner/issues/4)).

- Added a home-directory safety guard in the deleter: every path is verified to
  be a strict descendant of `os.homedir()` (symlinks/traversal resolved) before
  any `rmSync`/`unlinkSync`. Paths like `/`, `/usr`, or `~/..` are now refused
  and counted as "blocked" instead of deleted
  ([#3](https://github.com/J-MaFf/mac-space-cleaner/issues/3)).

- `--confirm-delete` no longer deletes without prompting. It now always shows an
  interactive `[y/N]` confirmation prompt, matching the safety its name implies
  ([#2](https://github.com/J-MaFf/mac-space-cleaner/issues/2)).

### Added

- Non-interactive `--yes`/`--auto-delete` runs now print a pre-delete summary
  (total reclaimable size + top-N paths by impact) before any deletion proceeds
  ([#5](https://github.com/J-MaFf/mac-space-cleaner/issues/5)).
- `--auto-delete` flag for explicit non-interactive deletion with no prompt
  (`--yes` is an alias). This replaces the old, surprising `--confirm-delete`
  bypass behavior ([#2](https://github.com/J-MaFf/mac-space-cleaner/issues/2)).

### Planned Features

- Interactive UI mode for easier file selection
- Browser-based dashboard
- Configuration file support (.mac-space-cleaner.json)
- Custom category definitions
- Scheduled automatic cleanup tasks
- File recovery/restore capability

## [1.0.0] - 2025-12-22

### Added

- **Core Scanning**: Recursive file system scanning with configurable depth and file limits
- **File Categorization**: Automatic detection of:
  - Large files
  - Old downloads
  - Cache directories (Library/Caches, Homebrew, npm, yarn)
  - Build artifacts (Xcode DerivedData)
  - Logs
  - Trash
- **Smart Suggestions**: Files scored by deletion safety and impact
- **CLI Interface** with flags:
  - `--json`: JSON output for scripting
  - `--sizeMB`: Custom size thresholds
  - `--days`: Custom age thresholds
  - `--paths`: Custom scan paths
  - `--exclude-patterns`: Skip path patterns
  - `--only-category`: Filter by category
- **Safe Deletion**:
  - `--dry-run`: Preview mode without actual deletion
  - `--confirm-delete`: Non-interactive deletion
  - `--interactive`: Confirmation prompts
- **Deletion Logging**: Automatic log files in `~/.mac-space-cleaner/`
- **Comprehensive Testing**: Jest unit tests with mocked fs operations
- **CI/CD**: GitHub Actions workflow for Node 16/18/20
- **Documentation**:
  - Detailed README with examples
  - Contributing guide
  - Copilot instructions for AI assistance
  - Comprehensive changelog

### Technical

- TypeScript with strict mode
- ES6 modules
- Async/await for I/O operations
- Type-safe categorization system
- Graceful error handling

---

For older versions or detailed version history, see the [releases page](https://github.com/J-MaFf/mac-space-cleaner/releases).
