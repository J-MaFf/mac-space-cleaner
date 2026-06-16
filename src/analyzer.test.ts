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

      // Without excludePatterns, both are large files (> 100 MB) and ARE
      // suggested (category 'other').
      const result = analyzer.analyze(files);
      expect(result.suggestions.length).toBe(2);

      // With excludePatterns matching the directory segments, both are skipped.
      const analyzerWithExclude = new Analyzer({
        sizeThresholdMB: 100,
        excludePatterns: ['node_modules', 'dist'],
      });
      const resultWithExclude = analyzerWithExclude.analyze(files);
      expect(resultWithExclude.suggestions.length).toBe(0);
    });

    it('should use glob matching, not substring (issue #6)', () => {
      const files: FileInfo[] = [
        {
          // A bare 'node' pattern must NOT exclude this — substring matching
          // wrongly did; glob segment/basename matching does not.
          path: '/Users/test/Downloads/node-installer.dmg',
          name: 'node-installer.dmg',
          size: 200 * 1024 * 1024,
          mtime: new Date(),
        },
        {
          // ...but a real 'node_modules' directory segment is still excluded.
          path: '/Users/test/Downloads/node_modules/big.bin',
          name: 'big.bin',
          size: 200 * 1024 * 1024,
          mtime: new Date(),
        },
      ];

      const analyzer6 = new Analyzer({
        sizeThresholdMB: 100,
        excludePatterns: ['node'],
      });
      const result = analyzer6.analyze(files);
      // node-installer.dmg survives; node_modules/big.bin is NOT excluded by
      // the bare 'node' pattern (segment is 'node_modules', not 'node').
      const paths = result.suggestions.map(s => s.file.path);
      expect(paths).toContain('/Users/test/Downloads/node-installer.dmg');
      expect(paths).toContain('/Users/test/Downloads/node_modules/big.bin');

      // A precise pattern excludes only the intended file.
      const analyzerNm = new Analyzer({
        sizeThresholdMB: 100,
        excludePatterns: ['node_modules'],
      });
      const resultNm = analyzerNm.analyze(files);
      const pathsNm = resultNm.suggestions.map(s => s.file.path);
      expect(pathsNm).toContain('/Users/test/Downloads/node-installer.dmg');
      expect(pathsNm).not.toContain('/Users/test/Downloads/node_modules/big.bin');

      // Glob wildcards work against the basename.
      const analyzerGlob = new Analyzer({
        sizeThresholdMB: 100,
        excludePatterns: ['*.dmg'],
      });
      const resultGlob = analyzerGlob.analyze(files);
      const pathsGlob = resultGlob.suggestions.map(s => s.file.path);
      expect(pathsGlob).not.toContain('/Users/test/Downloads/node-installer.dmg');
      expect(pathsGlob).toContain('/Users/test/Downloads/node_modules/big.bin');
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
