export const readFile = async (filePath: string): Promise<string> => {
    const fs = require('fs').promises;
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return data;
    } catch (error) {
        throw new Error(`Error reading file at ${filePath}: ${error.message}`);
    }
};

export const deleteFile = async (filePath: string): Promise<void> => {
    const fs = require('fs').promises;
    try {
        await fs.unlink(filePath);
    } catch (error) {
        throw new Error(`Error deleting file at ${filePath}: ${error.message}`);
    }
};