import path from 'path';
import { AnalysisResult, Category, FileInfo, Suggestion } from './types';

export interface AnalyzeOptions {
    sizeThresholdMB?: number;
    ageThresholdDays?: number;
    topN?: number;
    excludePatterns?: string[];
    onlyCategory?: Category;
}

export class Analyzer {
    constructor(private options: AnalyzeOptions = {}) {}

    analyze(files: FileInfo[]): AnalysisResult {
        const sizeThresholdMB = this.options.sizeThresholdMB ?? 100; // 100MB
        const ageThresholdDays = this.options.ageThresholdDays ?? 30; // 30 days

        const suggestions: Suggestion[] = [];
        const byCategory: AnalysisResult['byCategory'] = {
            large: { count: 0, size: 0 },
            'old-download': { count: 0, size: 0 },
            cache: { count: 0, size: 0 },
            logs: { count: 0, size: 0 },
            'xcode-deriveddata': { count: 0, size: 0 },
            'homebrew-cache': { count: 0, size: 0 },
            'npm-cache': { count: 0, size: 0 },
            'yarn-cache': { count: 0, size: 0 },
            trash: { count: 0, size: 0 },
            other: { count: 0, size: 0 },
        };

        const now = Date.now();
        for (const f of files) {
            const sizeMB = f.size / (1024 * 1024);
            const daysOld = Math.floor((now - (f.atime?.getTime() ?? f.mtime.getTime())) / (1000 * 3600 * 24));
            const category = this.detectCategory(f);

            let reason = '';
            let score = 0;
            if (category === 'trash') {
                reason = 'In Trash';
                score = 0.95;
            } else if (category === 'cache' || category === 'homebrew-cache' || category === 'npm-cache' || category === 'yarn-cache' || category === 'xcode-deriveddata' || category === 'logs') {
                reason = 'Cache/Build/Log artifact';
                score = Math.min(0.9, 0.5 + sizeMB / 1000);
            } else if (category === 'old-download' && daysOld > ageThresholdDays) {
                reason = `Old file in Downloads (${daysOld} days)`;
                score = Math.min(0.8, 0.3 + sizeMB / 500);
            } else if (sizeMB > sizeThresholdMB) {
                reason = `Large file (${sizeMB.toFixed(1)} MB)`;
                score = Math.min(0.7, 0.2 + sizeMB / 500);
            }

            const effectiveCategory: Category = reason ? category : 'other';
            byCategory[effectiveCategory].count += 1;
            byCategory[effectiveCategory].size += f.size;

            if (reason) {
                // Apply filters
                if (this.options.excludePatterns?.some(p => f.path.includes(p))) {
                    continue;
                }
                if (this.options.onlyCategory && effectiveCategory !== this.options.onlyCategory) {
                    continue;
                }
                suggestions.push({ file: { ...f, category: effectiveCategory }, category: effectiveCategory, reason, score });
            }
        }

        // Sort suggestions by score then size
        suggestions.sort((a, b) => b.score - a.score || b.file.size - a.file.size);

        const totalSize = files.reduce((acc, f) => acc + f.size, 0);
        const result: AnalysisResult = {
            totalFiles: files.length,
            totalSize,
            suggestions,
            byCategory,
            report: this.generateReport({
                totalFiles: files.length,
                totalSize,
                suggestions,
                byCategory,
                report: '',
            }),
        };
        return result;
    }

    generateReport(analysis: AnalysisResult): string {
        const fmtSize = (bytes: number) => {
            const mb = bytes / (1024 * 1024);
            if (mb < 1024) return `${mb.toFixed(1)} MB`;
            return `${(mb / 1024).toFixed(2)} GB`;
        };

        let out = '';
        out += `Mac Space Cleaner Report\n`;
        out += `Total files scanned: ${analysis.totalFiles}\n`;
        out += `Total size scanned: ${fmtSize(analysis.totalSize)}\n`;
        out += `\nBy category:\n`;
        for (const [cat, agg] of Object.entries(analysis.byCategory)) {
            if (agg.count === 0) continue;
            out += `- ${cat}: ${agg.count} items, ${fmtSize(agg.size)}\n`;
        }

        const top = analysis.suggestions.slice(0, 50);
        if (top.length) {
            out += `\nTop suggestions:\n`;
            for (const s of top) {
                out += `- [${s.category}] ${s.file.path} — ${fmtSize(s.file.size)} — ${s.reason}\n`;
            }
        }
        return out;
    }

    private detectCategory(f: FileInfo): Category {
        const p = f.path;
        const d = p.toLowerCase();
        if (d.includes('/.trash/')) return 'trash';
        if (d.includes('/downloads/')) return 'old-download';
        if (d.includes('/library/developer/xcode/deriveddata')) return 'xcode-deriveddata';
        if (d.includes('/library/caches/homebrew')) return 'homebrew-cache';
        if (d.includes('/.npm/')) return 'npm-cache';
        if (d.includes('/.cache/yarn')) return 'yarn-cache';
        if (d.includes('/library/logs')) return 'logs';
        if (d.includes('/library/caches')) return 'cache';
        return 'other';
    }
}