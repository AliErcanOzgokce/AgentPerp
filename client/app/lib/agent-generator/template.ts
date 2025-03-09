import fs from 'fs';
import path from 'path';
import { CharacterConfig } from '../types/character';

const AGENTS_ROOT = path.join(process.cwd(), '..', 'agents');
const TEMPLATE_DIR = path.join(AGENTS_ROOT, 'eliza-starter');

/**
 * Creates a new agent directory from the template
 * @param name Agent name
 * @returns Path to the new agent directory
 */
export async function createAgentFromTemplate(name: string): Promise<string> {
    try {
        // Convert name to kebab case for directory
        const dirName = name.toLowerCase().replace(/\s+/g, '-');
        const targetDir = path.join(AGENTS_ROOT, dirName);

        // Check if directory already exists
        if (fs.existsSync(targetDir)) {
            throw new Error(`Agent directory already exists: ${dirName}`);
        }

        // Copy template directory
        await copyDirectory(TEMPLATE_DIR, targetDir);

        return targetDir;
    } catch (error) {
        console.error('Error creating agent from template:', error);
        throw error;
    }
}

/**
 * Updates the character configuration file
 * @param agentDir Path to agent directory
 * @param config Character configuration
 */
export async function updateCharacterConfig(
    agentDir: string,
    config: CharacterConfig
): Promise<void> {
    try {
        const configPath = path.join(agentDir, 'characters', 'eliza.character.json');
        
        // Ensure characters directory exists
        const charactersDir = path.dirname(configPath);
        if (!fs.existsSync(charactersDir)) {
            fs.mkdirSync(charactersDir, { recursive: true });
        }

        // Write config file
        await fs.promises.writeFile(
            configPath,
            JSON.stringify(config, null, 2),
            'utf-8'
        );
    } catch (error) {
        console.error('Error updating character config:', error);
        throw error;
    }
}

/**
 * Recursively copies a directory
 * @param src Source directory
 * @param dest Destination directory
 */
async function copyDirectory(src: string, dest: string): Promise<void> {
    try {
        // Create destination directory
        await fs.promises.mkdir(dest, { recursive: true });

        // Read source directory
        const entries = await fs.promises.readdir(src, { withFileTypes: true });

        // Copy each entry
        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);

            if (entry.isDirectory()) {
                await copyDirectory(srcPath, destPath);
            } else {
                await fs.promises.copyFile(srcPath, destPath);
            }
        }
    } catch (error) {
        console.error('Error copying directory:', error);
        throw error;
    }
}