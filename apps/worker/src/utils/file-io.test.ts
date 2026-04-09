import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs/promises';
import { ensureDirectory, atomicWrite, readJson, fileExists } from './file-io.js';

vi.mock('node:fs/promises');

describe('file-io', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('ensureDirectory', () => {
    it('should create directory successfully', async () => {
      vi.mocked(fs.mkdir).mockResolvedValueOnce(undefined);
      await ensureDirectory('/test/dir');
      expect(fs.mkdir).toHaveBeenCalledWith('/test/dir', { recursive: true });
    });

    it('should ignore EEXIST errors', async () => {
      const eexistError = new Error('File exists') as NodeJS.ErrnoException;
      eexistError.code = 'EEXIST';
      vi.mocked(fs.mkdir).mockRejectedValueOnce(eexistError);

      await expect(ensureDirectory('/test/dir')).resolves.toBeUndefined();
      expect(fs.mkdir).toHaveBeenCalledWith('/test/dir', { recursive: true });
    });

    it('should throw non-EEXIST errors', async () => {
      const otherError = new Error('Permission denied') as NodeJS.ErrnoException;
      otherError.code = 'EACCES';
      vi.mocked(fs.mkdir).mockRejectedValueOnce(otherError);

      await expect(ensureDirectory('/test/dir')).rejects.toThrow('Permission denied');
      expect(fs.mkdir).toHaveBeenCalledWith('/test/dir', { recursive: true });
    });
  });

  describe('atomicWrite', () => {
    it('should write string data atomically', async () => {
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined);
      vi.mocked(fs.rename).mockResolvedValueOnce(undefined);

      await atomicWrite('/test/file.txt', 'hello world');

      expect(fs.writeFile).toHaveBeenCalledWith('/test/file.txt.tmp', 'hello world', 'utf8');
      expect(fs.rename).toHaveBeenCalledWith('/test/file.txt.tmp', '/test/file.txt');
    });

    it('should write object data atomically as JSON', async () => {
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined);
      vi.mocked(fs.rename).mockResolvedValueOnce(undefined);

      const data = { key: 'value' };
      await atomicWrite('/test/file.json', data);

      expect(fs.writeFile).toHaveBeenCalledWith(
        '/test/file.json.tmp',
        JSON.stringify(data, null, 2),
        'utf8'
      );
      expect(fs.rename).toHaveBeenCalledWith('/test/file.json.tmp', '/test/file.json');
    });

    it('should clean up temp file if rename fails', async () => {
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined);
      vi.mocked(fs.rename).mockRejectedValueOnce(new Error('Rename failed'));
      vi.mocked(fs.unlink).mockResolvedValueOnce(undefined);

      await expect(atomicWrite('/test/file.txt', 'data')).rejects.toThrow('Rename failed');

      expect(fs.unlink).toHaveBeenCalledWith('/test/file.txt.tmp');
    });

    it('should ignore unlink errors during cleanup if rename fails', async () => {
      vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined);
      vi.mocked(fs.rename).mockRejectedValueOnce(new Error('Rename failed'));
      vi.mocked(fs.unlink).mockRejectedValueOnce(new Error('Unlink failed'));

      await expect(atomicWrite('/test/file.txt', 'data')).rejects.toThrow('Rename failed');

      expect(fs.unlink).toHaveBeenCalledWith('/test/file.txt.tmp');
    });
  });

  describe('readJson', () => {
    it('should read and parse JSON file', async () => {
      const data = { foo: 'bar' };
      vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify(data));

      const result = await readJson<{ foo: string }>('/test/file.json');

      expect(fs.readFile).toHaveBeenCalledWith('/test/file.json', 'utf8');
      expect(result).toEqual(data);
    });
  });

  describe('fileExists', () => {
    it('should return true if file exists', async () => {
      vi.mocked(fs.access).mockResolvedValueOnce(undefined);

      const result = await fileExists('/test/file.txt');

      expect(fs.access).toHaveBeenCalledWith('/test/file.txt');
      expect(result).toBe(true);
    });

    it('should return false if file does not exist', async () => {
      vi.mocked(fs.access).mockRejectedValueOnce(new Error('ENOENT'));

      const result = await fileExists('/test/missing.txt');

      expect(fs.access).toHaveBeenCalledWith('/test/missing.txt');
      expect(result).toBe(false);
    });
  });
});
