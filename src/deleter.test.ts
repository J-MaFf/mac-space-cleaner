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
      const inHome = path.join(os.homedir(), '.Trash', 'file1.txt');
      const suggestions: Suggestion[] = [
        {
          file: {
            path: inHome,
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
      (mockFs.realpathSync as unknown as jest.Mock).mockImplementation((p: string) => p);

      const result = await deleter.delete(suggestions);

      expect(result.deleted).toBe(1);
      expect(result.failed).toBe(0);
      expect(mockFs.unlinkSync).not.toHaveBeenCalled();
    });

    it('should skip non-existent files', async () => {
      const inHome = path.join(os.homedir(), '.Trash', 'nonexistent.txt');
      const suggestions: Suggestion[] = [
        {
          file: {
            path: inHome,
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


  describe('home-directory safety guard', () => {
    const home = os.homedir();

    const makeSuggestion = (p: string): Suggestion => ({
      file: { path: p, name: path.basename(p), size: 2048, mtime: new Date() },
      category: 'cache',
      reason: 'Cache/Build/Log artifact',
      score: 0.6,
    });

    it('blocks paths outside the home directory and never calls rmSync/unlinkSync', async () => {
      const realDeleter = new Deleter({}); // dryRun false so deletion would occur if not blocked

      mockFs.existsSync.mockReturnValue(true);
      // realpathSync returns the path unchanged (no symlink indirection in test)
      (mockFs.realpathSync as unknown as jest.Mock).mockImplementation((p: string) => p);
      mockFs.lstatSync.mockReturnValue({ isDirectory: () => true } as any);
      mockFs.mkdirSync.mockReturnValue(undefined as any);
      mockFs.appendFileSync.mockReturnValue(undefined as any);

      const suggestions: Suggestion[] = [
        makeSuggestion('/'),
        makeSuggestion('/usr/local/bin'),
        makeSuggestion('/etc/passwd'),
      ];

      const result = await realDeleter.delete(suggestions);

      expect(result.blocked).toBe(3);
      expect(result.deleted).toBe(0);
      expect(mockFs.rmSync).not.toHaveBeenCalled();
      expect(mockFs.unlinkSync).not.toHaveBeenCalled();
    });

    it('allows paths that are strict descendants of home', async () => {
      const realDeleter = new Deleter({});

      mockFs.existsSync.mockReturnValue(true);
      (mockFs.realpathSync as unknown as jest.Mock).mockImplementation((p: string) => p);
      mockFs.lstatSync.mockReturnValue({ isDirectory: () => false } as any);
      mockFs.mkdirSync.mockReturnValue(undefined as any);
      mockFs.appendFileSync.mockReturnValue(undefined as any);
      mockFs.unlinkSync.mockReturnValue(undefined as any);

      const inside = path.join(home, 'Library', 'Caches', 'thing.bin');
      const result = await realDeleter.delete([makeSuggestion(inside)]);

      expect(result.blocked).toBe(0);
      expect(result.deleted).toBe(1);
      expect(mockFs.unlinkSync).toHaveBeenCalledWith(inside);
    });

    it('blocks the home directory itself', async () => {
      const realDeleter = new Deleter({});

      mockFs.existsSync.mockReturnValue(true);
      (mockFs.realpathSync as unknown as jest.Mock).mockImplementation((p: string) => p);
      mockFs.lstatSync.mockReturnValue({ isDirectory: () => true } as any);
      mockFs.mkdirSync.mockReturnValue(undefined as any);
      mockFs.appendFileSync.mockReturnValue(undefined as any);

      const result = await realDeleter.delete([makeSuggestion(home)]);

      expect(result.blocked).toBe(1);
      expect(result.deleted).toBe(0);
      expect(mockFs.rmSync).not.toHaveBeenCalled();
    });

    it('blocks traversal that escapes home (~/../outside)', async () => {
      const realDeleter = new Deleter({});

      mockFs.existsSync.mockReturnValue(true);
      // realpathSync resolves the traversal to a sibling of home, i.e. outside it.
      const escaped = path.resolve(home, '..', 'someone-else');
      (mockFs.realpathSync as unknown as jest.Mock).mockImplementation(() => escaped);
      mockFs.lstatSync.mockReturnValue({ isDirectory: () => true } as any);
      mockFs.mkdirSync.mockReturnValue(undefined as any);
      mockFs.appendFileSync.mockReturnValue(undefined as any);

      const result = await realDeleter.delete([makeSuggestion(path.join(home, '..', 'someone-else'))]);

      expect(result.blocked).toBe(1);
      expect(mockFs.rmSync).not.toHaveBeenCalled();
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
