# Troubleshooting Guide

## Common Issues and Solutions

### Installation Issues

#### `npm: command not found`

**Problem**: Node.js or npm is not installed on your system.

**Solution**:

1. Download Node.js from [nodejs.org](https://nodejs.org/) (LTS version recommended)
2. Run the installer and follow the prompts
3. Verify installation: `node --version && npm --version`

#### `Module not found: @types/node`

**Problem**: TypeScript type definitions are missing.

**Solution**:

```bash
npm install
```

This installs all dependencies including `@types/node`.

### Runtime Issues

#### `Cannot find module 'fs'` or `Cannot find module 'path'`

**Problem**: TypeScript compiler error for Node.js built-in modules.

**Solution**:

1. Ensure `@types/node` is installed: `npm install`
2. Verify `tsconfig.json` has `"lib": ["es6"]` or similar
3. Try rebuilding: `npm run build`

#### Permission denied when scanning certain directories

**Problem**: Scanner encounters `EACCES` errors when accessing restricted directories.

**Solution**:

- This is normal. The scanner gracefully skips inaccessible directories
- To scan all directories, you may need to run with elevated privileges (not recommended)
- The scanner will log permission issues to stderr but continue scanning

#### No files found / empty report

**Problem**: Scanner runs but finds no suggested files.

**Possible Causes**:

1. Your system is very clean (congratulations!)
2. Thresholds are too high: `--sizeMB=100` won't suggest files under 100 MB
3. Custom paths don't exist: verify path names with `--paths=/your/path`

**Solutions**:

```bash
# Lower size threshold
npm start -- --sizeMB=10

# Lower age threshold
npm start -- --days=7

# Check specific directory
npm start -- --paths=/Users/$USER/Downloads

# See verbose output
npm start -- --json | jq '.totalFiles'
```

#### Symlink warnings

**Problem**: Warnings about circular symlinks or unresolved paths.

**Solution**:

- By default, symlinks are followed correctly
- If you encounter issues, use: `npm start -- --paths=/specific/path`
- The tool has built-in protection against circular symlinks

### Deletion Issues

#### `--dry-run` shows files but they don't delete

**Problem**: You're previewing deletions, not actually deleting them.

**Solution**:

- Dry-run is intentional for safety
- Remove `--dry-run` and add `--confirm-delete` to actually delete:

  ```bash
  npm start -- --only-category=trash --confirm-delete
  ```

#### Permission denied when deleting

**Problem**: Cannot delete certain files even with confirmation.

**Likely Causes**:

1. File is in use by another process
2. Insufficient permissions
3. File is on a read-only drive/mount

**Solutions**:

1. Close applications that might be using the files
2. Check file permissions: `ls -la /path/to/file`
3. Try with elevated privileges (if needed): `sudo npm start -- --confirm-delete`

#### Where is the deletion log?

**Problem**: Cannot find record of deleted files.

**Solution**:

```bash
# Logs are stored here:
ls -la ~/.mac-space-cleaner/

# View the latest log:
cat ~/.mac-space-cleaner/deletions-*.log

# Follow logs in real-time:
tail -f ~/.mac-space-cleaner/deletions-*.log
```

### Output Issues

#### CLI output is truncated or hard to read

**Problem**: Report is too verbose or doesn't fit screen.

**Solutions**:

```bash
# Get JSON output for easier parsing
npm start -- --json | jq '.suggestions | length'

# Save report to file
npm start > report.txt

# Show only summary
npm start -- --json | jq '.byCategory'
```

#### JSON output format is wrong

**Problem**: JSON is malformed or has unexpected structure.

**Solution**:

```bash
# Validate JSON
npm start -- --json | jq '.'

# Pretty print JSON
npm start -- --json | jq '.' | less
```

### Performance Issues

#### Scanning is very slow

**Problem**: Scanner takes too long on large file systems.

**Causes**:

1. Scanning too many files: `--maxFiles=20000` limit exceeded
2. Directory depth too high: `--maxDepth=4` set high
3. Network mounts being scanned

**Solutions**:

```bash
# Limit scan scope
npm start -- --paths=/Users/$USER/Downloads

# Reduce depth
npm start -- --maxDepth=2

# Exclude slow paths
npm start -- --exclude-patterns=node_modules,.git,Volumes
```

#### Memory usage is high

**Problem**: Process uses significant memory.

**Solution**:

```bash
# Reduce file limit
npm start -- --maxFiles=5000

# Scan smaller scope
npm start -- --paths=/specific/path
```

### Testing Issues

#### Tests fail when running locally but pass in CI

**Problem**: Environment differences between local and CI.

**Possible Causes**:

1. Different Node.js versions
2. Missing mocks for fs operations
3. Path separators (Windows vs Unix)

**Solutions**:

```bash
# Check Node version matches CI config
node --version  # Should match .github/workflows/ci.yml

# Run tests with specific Node version
nvm use 18
npm test

# Check test mocks
cat src/analyzer.test.ts | grep -A 5 "jest.mock"
```

#### Cannot run `npm test`

**Problem**: Test command fails or no tests found.

**Solutions**:

```bash
# Install dev dependencies
npm install

# Check Jest config
cat jest.config.json

# Run with verbose output
npm test -- --verbose

# Run specific test
npm test -- src/analyzer.test.ts
```

## Getting Help

If you can't find a solution:

1. **Check the docs**:
   - [README.md](README.md) - Usage and examples
   - [CONTRIBUTING.md](CONTRIBUTING.md) - Development setup
   - [.github/copilot-instructions.md](.github/copilot-instructions.md) - Architecture

2. **Search existing issues**:
   - <https://github.com/J-MaFf/mac-space-cleaner/issues>

3. **Open a new issue** with:
   - macOS version (`sw_vers`)
   - Node version (`node --version`)
   - Command you ran
   - Full error message
   - Steps to reproduce

4. **Try the debug commands**:

   ```bash
   # Check environment
   node --version && npm --version

   # Verify installation
   npm list

   # Run with explicit error output
   npm start -- --json 2>&1 | tee debug.log
   ```

---

**Last updated**: 2025-12-22
