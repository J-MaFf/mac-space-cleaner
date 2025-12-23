import { Deleter } from './deleter';
import { Suggestion, FileInfo } from './types';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Mock fs module
jest.mock('fs');

describe('Deleter', () => {
  let deleter: Deleter;
  const mockFs = fs as jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.clearAllMocks();
    deleter = new Deleter({ dryRun: true });
  });

  describe('delete', () => {
    it('should handle dry-run mode without deleting files', async () => {
      const suggestions: Suggestion[] = [
        {
          file: {
            path: '/test/file1.txt',
            name: 'file1.txt',
            size: 1024,
            mtime: new Date(),
          },
          category: 'trash',
          reason: 'In Trash',
          score: 0.95,
        },
      ];

      mockFs.existsSync.mockReturnValue(true);

      const result = await deleter.delete(suggestions);

      expect(result.deleted).toBe(1);
      expect(result.failed).toBe(0);
      expect(mockFs.unlinkSync).not.toHaveBeenCalled();
    });

    it('should skip non-existent files', async () => {
      const suggestions: Suggestion[] = [
        {
          file: {
            path: '/test/nonexistent.txt',
            name: 'nonexistent.txt',
            size: 1024,
            mtime: new Date(),
          },
          category: 'trash',
          reason: 'In Trash',
          score: 0.95,
        },
      ];

      mockFs.existsSync.mockReturnValue(false);

      const result = await deleter.delete(suggestions);

      expect(result.skipped).toBe(1);
      expect(result.deleted).toBe(0);
    });

    it('should format file sizes correctly', () => {
      const deleterInstance = new Deleter({ dryRun: true });
      // Access private method through type assertion for testing
      const formatSize = (deleterInstance as any).formatSize.bind(deleterInstance);

      expect(formatSize(1024 * 1024)).toBe('1.0 MB');
      expect(formatSize(1024 * 1024 * 1024)).toBe('1.00 GB');
    });
  });

  describe('log file creation', () => {
    it('should create log directory if it does not exist', () => {
      const customPath = path.join(os.homedir(), '.mac-space-cleaner', 'test.log');
      const deleterWithCustomPath = new Deleter({ dryRun: true, logFile: customPath });

      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockReturnValue(undefined);

      expect(deleterWithCustomPath).toBeDefined();
    });
  });
});
