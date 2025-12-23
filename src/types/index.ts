export type Category =
    | 'large'
    | 'old-download'
    | 'cache'
    | 'logs'
    | 'xcode-deriveddata'
    | 'homebrew-cache'
    | 'npm-cache'
    | 'yarn-cache'
    | 'trash'
    | 'other';

export interface FileInfo {
    path: string;
    name: string;
    size: number;
    mtime: Date;
    atime?: Date;
    category?: Category;
}

export interface Suggestion {
    file: FileInfo;
    category: Category;
    reason: string;
    score: number;
}

export interface AnalysisResult {
    totalFiles: number;
    totalSize: number;
    suggestions: Suggestion[];
    byCategory: Record<Category, { count: number; size: number }>;
    report: string;
}