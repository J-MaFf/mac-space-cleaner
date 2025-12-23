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

   ```
   git clone https://github.com/yourusername/mac-space-cleaner.git
   ```

2. Navigate to the project directory:

   ```
   cd mac-space-cleaner
   ```

3. Install the dependencies:

   ```
   npm install
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

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
