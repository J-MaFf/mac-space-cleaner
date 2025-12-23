# Contributing to Mac Space Cleaner

Thank you for considering contributing to Mac Space Cleaner! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on code and ideas, not individuals

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm 7.x or later
- Git

### Setup Development Environment

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/mac-space-cleaner.git
cd mac-space-cleaner

# Install dependencies
npm install

# Create a feature branch
git checkout -b feature/your-feature-name
```

## Development Workflow

### Building

```bash
npm run build
```

Outputs compiled JavaScript to `dist/` directory.

### Testing

```bash
# Run tests once
npm test

# Run tests in watch mode during development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

All new features should include tests. Aim for at least 80% code coverage.

### Code Style

This project uses:

- **TypeScript** with strict mode enabled
- **camelCase** for variables and methods
- **PascalCase** for classes
- **JSDoc** comments for public APIs

Example:

```typescript
/**
 * Analyzes files and generates deletion suggestions.
 * @param files - Array of FileInfo objects to analyze
 * @returns AnalysisResult with suggestions grouped by category
 */
export function analyze(files: FileInfo[]): AnalysisResult {
  // implementation
}
```

### Types and Interfaces

All public functions and classes should have proper TypeScript types. Update `src/types/index.ts` when adding new types.

## Making Changes

### Types of Contributions

**Bug Fixes**

- Fix broken functionality
- Add unit test that reproduces the bug
- Reference the issue number in your commit message

**Features**

- Add new functionality following the project architecture
- Include comprehensive tests
- Update README.md with usage examples
- Update `.github/copilot-instructions.md` if relevant

**Documentation**

- Improve README or code comments
- Add examples or clarifications
- Fix typos

### Commit Messages

Follow conventional commit format:

```
type(scope): description

Optional longer explanation. Reference issues with #123.
```

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`

Examples:

```
feat(scanner): add support for external drives
fix(analyzer): handle symlinks correctly
docs(readme): add troubleshooting section
test(deleter): add dry-run mode tests
```

### Pull Request Process

1. **Create a feature branch** from `main`

   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes** with clear, focused commits

3. **Write/update tests**
   - Add tests in `src/*.test.ts`
   - Maintain or improve code coverage
   - Run `npm test` to verify

4. **Build and test locally**

   ```bash
   npm run build
   npm test
   ```

5. **Update documentation**
   - README.md if behavior changes
   - `.github/copilot-instructions.md` if architecture changes
   - JSDoc comments for new functions

6. **Push to your fork and open a PR**

   ```bash
   git push origin feature/my-feature
   ```

7. **PR checklist:**
   - [ ] Tests pass (`npm test`)
   - [ ] Build succeeds (`npm run build`)
   - [ ] Code follows style guidelines
   - [ ] Documentation is updated
   - [ ] Commit messages are clear
   - [ ] No breaking changes (or documented)

## Project Architecture

See [.github/copilot-instructions.md](.github/copilot-instructions.md) for detailed architecture, design patterns, and extension guidelines.

### Key Modules

- **Scanner** (`src/scanner.ts`): Discovers files with recursive walking
- **Analyzer** (`src/analyzer.ts`): Categorizes and scores suggestions
- **Deleter** (`src/deleter.ts`): Safe file deletion with logging
- **Main** (`src/main.ts`): CLI argument parsing and orchestration

## Safety Guidelines

⚠️ **This tool handles file deletion.** Always:

- Require explicit user confirmation before deleting anything
- Test with `--dry-run` first
- Log all deletions to `~/.mac-space-cleaner/deletions-YYYY-MM-DD.log`
- Handle errors gracefully and continue scanning
- Never delete files silently

## Testing Guidelines

### Test Coverage

Aim for:

- Unit tests for all modules
- Edge cases (empty dirs, symlinks, permission errors)
- Mock fs for Deleter tests
- Sample data for Analyzer tests

### Running Tests

```bash
# Run all tests with coverage
npm run test:coverage

# Run specific test file
npx jest src/analyzer.test.ts

# Run tests matching pattern
npx jest --testNamePattern="should detect trash"
```

## Reporting Bugs

When opening a bug report, include:

- macOS version
- Node.js version
- Exact command that failed
- Error message or unexpected behavior
- Steps to reproduce
- Expected vs actual behavior

## Suggesting Enhancements

When suggesting features:

- Describe the use case
- Provide examples of how it would be used
- Explain why it would be useful
- Consider performance impact

## Questions?

Feel free to open an issue with the `question` label or start a discussion.

---

Thank you for contributing! 🙏
