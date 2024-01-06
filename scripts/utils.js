// @ts-check
import fs from 'fs-extra';
import path from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const rootDir = path.join(__dirname, '..');

/**
 * @param {string} path
 */
export const loadJSON = async path => await fs.readJSON(new URL(path, import.meta.url));
