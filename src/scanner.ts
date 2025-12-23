import fs from 'fs';
import path from 'path';
import os from 'os';
import { FileInfo } from './types';

export interface ScanOptions {
    maxDepth?: number;
    maxFiles?: number;
    followSymlinks?: boolean;
}

export class Scanner {
    private files: FileInfo[] = [];

    constructor(private options: ScanOptions = {}) {}

    async scan(pathsToScan?: string[]): Promise<FileInfo[]> {
        const home = os.homedir();
        const defaults = [
            path.join(home, 'Downloads'),
            path.join(home, 'Library', 'Caches'),
            path.join(home, 'Library', 'Logs'),
            path.join(home, 'Library', 'Developer', 'Xcode', 'DerivedData'),
            path.join(home, 'Library', 'Caches', 'Homebrew'),
            path.join(home, '.npm'),
            path.join(home, '.cache', 'yarn'),
            path.join(home, '.Trash'),
        ];

        const targets = (pathsToScan && pathsToScan.length ? pathsToScan : defaults)
            .filter(p => fs.existsSync(p));

        for (const target of targets) {
            await this.walk(target, 0);
            if (this.options.maxFiles && this.files.length >= this.options.maxFiles) break;
        }

        return this.files;
    }

    private async walk(dir: string, depth: number): Promise<void> {
        if (this.options.maxDepth !== undefined && depth > this.options.maxDepth) return;
        let entries: fs.Dirent[] = [];
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch {
            return;
        }

        for (const entry of entries) {
            const full = path.join(dir, entry.name);
            let stat: fs.Stats;
            try {
                stat = this.options.followSymlinks ? fs.statSync(full) : fs.lstatSync(full);
            } catch {
                continue;
            }

            if (stat.isSymbolicLink() && !this.options.followSymlinks) continue;

            if (stat.isDirectory()) {
                await this.walk(full, depth + 1);
            } else if (stat.isFile()) {
                this.files.push({
                    path: full,
                    name: entry.name,
                    size: stat.size,
                    mtime: stat.mtime,
                    atime: stat.atime,
                });
                if (this.options.maxFiles && this.files.length >= this.options.maxFiles) return;
            }
        }
    }

    getFiles(): FileInfo[] {
        return this.files;
    }
}