// @ts-check
/**
 * checking before publish
 */

import fs from 'fs-extra';
import glob from 'fast-glob';
import path from 'path';
import chalk from 'chalk';
import { rootDir } from './utils.js';

/**
 * This checking is to ensure that the output files are not requiring absolute path module, e.g.
 * const open = require('/Users/xxx/packages/webpack/node_modules/open/index.js');
 *
 * This happen if the module cannot exclude by the `external` config in `vite.config.ts`
 * To solve the issue make sure the package is exists in any package.json, or udpate the `external` config
 */
const expectOutputFilesNotRequiringAbsolutePathModule = async () => {
  const files = await glob(['**/*'], { absolute: true, cwd: path.join(rootDir, 'dist') });
  const errors = await Promise.all(
    files.map(async file => {
      const content = await fs.readFile(file, 'utf-8');
      if (content.includes(rootDir)) return file;
    })
  ).then(files => files.filter(Boolean));

  if (errors.length)
    throw chalk.red(`These output files are requiring absolute path module`, JSON.stringify(errors, null, 2));
};

try {
  await expectOutputFilesNotRequiringAbsolutePathModule();
} catch (error) {
  console.error(error);
}
