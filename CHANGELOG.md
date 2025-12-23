# Changelog

All notable changes to Mac Space Cleaner will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
