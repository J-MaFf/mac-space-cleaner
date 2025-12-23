# Mac Space Cleaner

Mac Space Cleaner is a utility application designed to help users identify and delete unnecessary files on their Mac to free up disk space. This project scans the file system, analyzes file metadata, and suggests files that can be safely removed.

## Features

- Scans the file system for files and directories.
- Analyzes files based on size, type, and last accessed date.
- Generates a user-friendly report of suggested files for deletion.
- Provides utility functions for reading and deleting files.

## Project Structure

```
mac-space-cleaner
├── src
│   ├── main.ts          # Entry point of the application
│   ├── scanner.ts       # Scanning functionality
│   ├── analyzer.ts      # File analysis and reporting
│   ├── types
│   │   └── index.ts     # Type definitions
│   └── utils
│       └── fileUtils.ts # Utility functions for file operations
├── package.json         # NPM configuration
├── tsconfig.json        # TypeScript configuration
└── README.md            # Project documentation
```

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/J-MaFf/mac-space-cleaner.git
   cd mac-space-cleaner
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

## Development

### Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

Output goes to `dist/` directory.

### Testing

Run the test suite:

```bash
npm test          # Run all tests
npm run test:watch     # Watch mode for development
npm run test:coverage  # Generate coverage report
```

Tests are located in `src/__tests__/` and `src/*.test.ts` files and cover:
- **Analyzer**: Categorization, filtering, scoring, and reporting
- **Deleter**: Safe deletion, dry-run mode, and logging
- **Scanner**: File discovery with depth/file limits, symlink handling

### Project Structure

```
mac-space-cleaner/
├── src/
│   ├── main.ts              # CLI entry point with argument parsing
│   ├── scanner.ts           # File system scanning
│   ├── analyzer.ts          # File analysis and categorization
│   ├── deleter.ts           # Safe file deletion and logging
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── utils/
│   │   ├── fileUtils.ts     # Legacy file utilities
│   │   └── prompt.ts        # Interactive CLI prompts
│   ├── analyzer.test.ts     # Analyzer unit tests
│   ├── deleter.test.ts      # Deleter unit tests
│   └── scanner.test.ts      # Scanner unit tests
├── .github/
│   ├── copilot-instructions.md  # AI assistant context
│   └── workflows/
│       └── ci.yml           # GitHub Actions CI/CD pipeline
├── package.json             # Project dependencies
├── tsconfig.json            # TypeScript compiler options
├── jest.config.json         # Jest testing configuration
├── LICENSE                  # MIT License
└── README.md                # This file
```

## Usage

Run the scanner (suggest-only by default):

```
npm start
```

### Flags

**Scanning options:**

- `--json`: Output JSON instead of text.
- `--sizeMB=100`: Threshold for large files (default 100).
- `--days=30`: Age threshold for old downloads (default 30).
- `--paths=/custom/path1,/custom/path2`: Comma-separated paths to scan.
- `--maxDepth=4`: Max directory recursion depth.
- `--maxFiles=20000`: Hard cap on total files scanned.

**Filtering options:**

- `--exclude-patterns=node_modules,dist`: Comma-separated path patterns to skip.
- `--only-category=trash`: Only suggest files from a specific category.

**Deletion options:**

- `--dry-run`: Preview deletions without actually deleting.
- `--confirm-delete`: Skip confirmation prompt and delete immediately.
- `--interactive`: Prompt for confirmation before deleting (default if `--confirm-delete` not set).

### Examples

```bash
# Scan and show report
npm start

# JSON output
npm start -- --json

# Custom thresholds
npm start -- --sizeMB=250 --days=60

# Exclude patterns
npm start -- --exclude-patterns=node_modules,.git,dist

# Only show trash suggestions
npm start -- --only-category=trash

# Preview deletions without actually deleting
npm start -- --dry-run

# Delete trash only after confirmation
npm start -- --only-category=trash --interactive

# Delete without prompt (use carefully!)
npm start -- --confirm-delete --dry-run
```

Categories covered:

- Large files
- Old files in Downloads
- Caches (Library/Caches, Homebrew)
- Build artifacts (Xcode DerivedData)
- Package manager caches (npm/yarn)
- Logs
- Trash

**Safety:** This tool only suggests files by default. Use `--dry-run` to preview, then add `--confirm-delete` to actually delete. Deletion logs are saved to `~/.mac-space-cleaner/deletions-YYYY-MM-DD.log`.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes and add tests
4. Run tests: `npm test`
5. Build and verify: `npm run build`
6. Commit with a clear message
7. Push and open a Pull Request

## Support

If you encounter issues or have questions:

- Check existing [GitHub issues](https://github.com/J-MaFf/mac-space-cleaner/issues)
- Open a new issue with details about your environment and problem

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
