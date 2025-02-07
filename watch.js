import chokidar from 'chokidar';
import { copyFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Define paths
const sourceDir = 'C:/dev/obsidian/plugin/calclue';
const targetDir = 'C:/dev/obsidian/calclue_dev/.obsidian/plugins/calclue';
const filesToWatch = ['manifest.json', 'main.js', 'styles.css'];

// Create target directory if it doesn't exist
try {
    await mkdir(targetDir, { recursive: true });
} catch (err) {
    if (err.code !== 'EEXIST') {
        console.error('Error creating target directory:', err);
        process.exit(1);
    }
}

// Watch files
filesToWatch.forEach((file) => {
    const sourcePath = join(sourceDir, file);
    chokidar.watch(sourcePath).on('change', async () => {
        try {
            await copyFile(sourcePath, join(targetDir, file));
            console.log(`${file} copied to ${targetDir}`);
        } catch (err) {
            console.error(`Error copying ${file}:`, err);
        }
    });
});

console.log(`Watching files: ${filesToWatch.join(', ')}`);
