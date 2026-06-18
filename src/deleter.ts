import fs from 'fs';
import path from 'path';
import os from 'os';
import { Suggestion } from './types';

export interface DeleteOptions {
  dryRun?: boolean;
  logFile?: string;
}

export class Deleter {
  private logFile: string;
  private homeDir: string;

  constructor(private options: DeleteOptions = {}) {
    this.homeDir = path.resolve(os.homedir());
    this.logFile =
      options.logFile ??
      path.join(
        os.homedir(),
        '.mac-space-cleaner',
        `deletions-${new Date().toISOString().split('T')[0]}.log`
      );
  }

  async delete(suggestions: Suggestion[]): Promise<{ deleted: number; failed: number; skipped: number; blocked: number }> {
    const stats = { deleted: 0, failed: 0, skipped: 0, blocked: 0 };

    // Ensure log directory exists
    if (!this.options.dryRun) {
      const dir = path.dirname(this.logFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    const entries: string[] = [];
    entries.push(`Mac Space Cleaner Deletion Log - ${new Date().toISOString()}`);
    entries.push(`Dry-run: ${this.options.dryRun ? 'YES' : 'NO'}`);
    entries.push('');

    for (const suggestion of suggestions) {
      const filePath = suggestion.file.path;

      // SAFETY GUARD: never delete anything outside the user's home directory.
      // A crafted or misbehaving --paths input could otherwise reach '/', '/usr',
      // etc. We refuse such paths before any rmSync/unlinkSync ever runs.
      if (!this.isWithinHome(filePath)) {
        entries.push(`[BLOCKED] ${filePath} - refused: not under home directory (${this.homeDir})`);
        stats.blocked++;
        continue;
      }

      try {
        if (!fs.existsSync(filePath)) {
          entries.push(`[SKIPPED] ${filePath} - file not found`);
          stats.skipped++;
          continue;
        }

        if (this.options.dryRun) {
          entries.push(`[DRY-RUN] Would delete: ${filePath} (${this.formatSize(suggestion.file.size)})`);
          stats.deleted++;
        } else {
          const stat = fs.lstatSync(filePath);
          if (stat.isDirectory()) {
            fs.rmSync(filePath, { recursive: true, force: true });
          } else {
            fs.unlinkSync(filePath);
          }
          entries.push(`[DELETED] ${filePath} (${this.formatSize(suggestion.file.size)})`);
          stats.deleted++;
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        entries.push(`[FAILED] ${filePath} - ${msg}`);
        stats.failed++;
      }
    }

    entries.push('');
    entries.push(`Summary: ${stats.deleted} deleted, ${stats.failed} failed, ${stats.skipped} skipped, ${stats.blocked} blocked`);

    if (!this.options.dryRun) {
      fs.appendFileSync(this.logFile, entries.join('\n') + '\n');
      console.log(`\nDeletion log saved to: ${this.logFile}`);
    }

    return stats;
  }

  /**
   * Returns true only when filePath is a strict descendant of the user's home
   * directory. The home directory itself, paths outside it, and traversal
   * attempts (e.g. ~/../../etc) all return false. Symlinks are resolved where
   * possible so a link inside home pointing outside is also rejected.
   */
  private isWithinHome(filePath: string): boolean {
    const home = this.homeDir;
    if (!home) return false;

    let resolved: string;
    try {
      // realpathSync collapses symlinks and traversal; fall back to resolve()
      // when the path does not exist (e.g. dry-run over a missing file).
      resolved = fs.existsSync(filePath)
        ? fs.realpathSync(filePath)
        : path.resolve(filePath);
    } catch {
      resolved = path.resolve(filePath);
    }

    // Must be strictly inside home: rel must not be empty, must not start with
    // '..', and must not be absolute (which path.relative returns when on a
    // different root/drive).
    const rel = path.relative(home, resolved);
    return (
      rel.length > 0 &&
      !rel.startsWith('..' + path.sep) &&
      rel !== '..' &&
      !path.isAbsolute(rel)
    );
  }

  private formatSize(bytes: number): string {
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  }
}
