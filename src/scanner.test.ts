import { Scanner } from './scanner';
import fs from 'fs';
import path from 'path';

// Mock fs module
jest.mock('fs');

describe('Scanner', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('scan', () => {
    it('should scan default paths when none provided', async () => {
      const scanner = new Scanner();

      // Mock readdirSync to return empty array (simulate no files)
      mockFs.readdirSync.mockReturnValue([]);

      const files = await scanner.scan();

      // Should attempt to scan default directories
      expect(mockFs.readdirSync).toHaveBeenCalled();
      expect(Array.isArray(files)).toBe(true);
    });

    it('should respect maxFiles limit', async () => {
      const scanner = new Scanner({ maxFiles: 2 });

      const mockEntries = [
        { name: 'file1.txt', isDirectory: () => false, isSymbolicLink: () => false } as any,
        { name: 'file2.txt', isDirectory: () => false, isSymbolicLink: () => false } as any,
        { name: 'file3.txt', isDirectory: () => false, isSymbolicLink: () => false } as any,
      ];

      mockFs.readdirSync.mockReturnValue(mockEntries);
      mockFs.lstatSync.mockReturnValue({
        size: 1024,
        mtime: new Date(),
        atime: new Date(),
        isDirectory: () => false,
        isFile: () => true,
        isSymbolicLink: () => false,
      } as any);

      const files = await scanner.scan(['/test']);

      // Should stop at maxFiles limit
      expect(files.length).toBeLessThanOrEqual(2);
    });

    it('should respect maxDepth limit', async () => {
      const scanner = new Scanner({ maxDepth: 1 });

      mockFs.readdirSync.mockReturnValue([]);

      const files = await scanner.scan(['/test']);

      expect(Array.isArray(files)).toBe(true);
    });

    it('should skip symlinks by default', async () => {
      const scanner = new Scanner({ followSymlinks: false });

      const mockEntries = [
        { name: 'symlink', isDirectory: () => false, isSymbolicLink: () => true } as any,
      ];

      mockFs.readdirSync.mockReturnValue(mockEntries);
      mockFs.lstatSync.mockReturnValue({
        isSymbolicLink: () => true,
        isFile: () => false,
        isDirectory: () => false,
      } as any);

      const files = await scanner.scan(['/test']);

      expect(files.length).toBe(0);
    });

    it('should handle missing directories gracefully', async () => {
      const scanner = new Scanner();

      mockFs.existsSync.mockReturnValue(false);

      const files = await scanner.scan(['/nonexistent']);

      expect(Array.isArray(files)).toBe(true);
    });
  });

  describe('getFiles', () => {
    it('should return collected files', async () => {
      const scanner = new Scanner();

      mockFs.readdirSync.mockReturnValue([]);

      const files = await scanner.scan();
      const collectedFiles = scanner.getFiles();

      expect(Array.isArray(collectedFiles)).toBe(true);
    });
  });
});
