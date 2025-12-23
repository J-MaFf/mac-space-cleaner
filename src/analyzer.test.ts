import { Analyzer } from './analyzer';
import { FileInfo } from './types';

describe('Analyzer', () => {
  let analyzer: Analyzer;

  beforeEach(() => {
    analyzer = new Analyzer({
      sizeThresholdMB: 100,
      ageThresholdDays: 30,
    });
  });

  describe('analyze', () => {
    it('should categorize files correctly', () => {
      const files: FileInfo[] = [
        {
          path: '/Users/test/.Trash/file.txt',
          name: 'file.txt',
          size: 1024,
          mtime: new Date(),
        },
        {
          path: '/Users/test/Downloads/old-doc.pdf',
          name: 'old-doc.pdf',
          size: 50 * 1024 * 1024,
          mtime: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days old
          atime: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        },
        {
          path: '/Users/test/Library/Caches/cache-file',
          name: 'cache-file',
          size: 200 * 1024 * 1024,
          mtime: new Date(),
        },
      ];

      const result = analyzer.analyze(files);

      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions.some(s => s.category === 'trash')).toBe(true);
      expect(result.suggestions.some(s => s.category === 'old-download')).toBe(true);
      expect(result.suggestions.some(s => s.category === 'cache')).toBe(true);
    });

    it('should score trash files highest', () => {
      const trashFile: FileInfo = {
        path: '/Users/test/.Trash/file.txt',
        name: 'file.txt',
        size: 1024,
        mtime: new Date(),
      };

      const result = analyzer.analyze([trashFile]);
      expect(result.suggestions[0].score).toBe(0.95);
    });

    it('should exclude patterns when provided', () => {
      const files: FileInfo[] = [
        {
          path: '/Users/test/node_modules/package',
          name: 'package',
          size: 200 * 1024 * 1024,
          mtime: new Date(),
        },
        {
          path: '/Users/test/dist/bundle.js',
          name: 'bundle.js',
          size: 150 * 1024 * 1024,
          mtime: new Date(),
        },
      ];

      const result = analyzer.analyze(files);
      // Without excludePatterns, both should be suggested as large
      expect(result.suggestions.length).toBe(0); // other category not suggested

      const analyzerWithExclude = new Analyzer({
        sizeThresholdMB: 100,
        excludePatterns: ['node_modules', 'dist'],
      });
      const resultWithExclude = analyzerWithExclude.analyze(files);
      expect(resultWithExclude.suggestions.length).toBe(0);
    });

    it('should filter by category when specified', () => {
      const files: FileInfo[] = [
        {
          path: '/Users/test/.Trash/file.txt',
          name: 'file.txt',
          size: 1024,
          mtime: new Date(),
        },
        {
          path: '/Users/test/Library/Caches/cache-file',
          name: 'cache-file',
          size: 200 * 1024 * 1024,
          mtime: new Date(),
        },
      ];

      const trashOnlyAnalyzer = new Analyzer({
        onlyCategory: 'trash',
      });
      const result = trashOnlyAnalyzer.analyze(files);
      expect(result.suggestions.every(s => s.category === 'trash')).toBe(true);
    });

    it('should generate a readable report', () => {
      const files: FileInfo[] = [
        {
          path: '/Users/test/.Trash/file.txt',
          name: 'file.txt',
          size: 1024,
          mtime: new Date(),
        },
      ];

      const result = analyzer.analyze(files);
      expect(result.report).toContain('Mac Space Cleaner Report');
      expect(result.report).toContain('files scanned');
    });

    it('should aggregate by category', () => {
      const files: FileInfo[] = [
        {
          path: '/Users/test/.Trash/file1.txt',
          name: 'file1.txt',
          size: 1024,
          mtime: new Date(),
        },
        {
          path: '/Users/test/.Trash/file2.txt',
          name: 'file2.txt',
          size: 2048,
          mtime: new Date(),
        },
      ];

      const result = analyzer.analyze(files);
      expect(result.byCategory.trash.count).toBe(2);
      expect(result.byCategory.trash.size).toBe(3072);
    });
  });

  describe('detectCategory', () => {
    it('should detect trash category', () => {
      const file: FileInfo = {
        path: '/Users/test/.Trash/old-file.txt',
        name: 'old-file.txt',
        size: 1024,
        mtime: new Date(),
      };

      const result = analyzer.analyze([file]);
      expect(result.suggestions[0].category).toBe('trash');
    });

    it('should detect xcode-deriveddata category', () => {
      const file: FileInfo = {
        path: '/Users/test/Library/Developer/Xcode/DerivedData/MyApp-abc/Build',
        name: 'Build',
        size: 500 * 1024 * 1024,
        mtime: new Date(),
      };

      const result = analyzer.analyze([file]);
      expect(result.suggestions[0].category).toBe('xcode-deriveddata');
    });

    it('should detect npm-cache category', () => {
      const file: FileInfo = {
        path: '/Users/test/.npm/package/1.0.0/package.tgz',
        name: 'package.tgz',
        size: 50 * 1024 * 1024,
        mtime: new Date(),
      };

      const result = analyzer.analyze([file]);
      expect(result.suggestions[0].category).toBe('npm-cache');
    });
  });
});
