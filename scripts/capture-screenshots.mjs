/**
 * Thin wrapper: run from overwire-web, capture via the Overwire extension harness.
 *
 *   CHROME=$(node "../../overwire/extension/scripts/install-chrome.mjs") \
 *     node scripts/capture-screenshots.mjs
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const script = path.resolve(
  __dirname,
  '../../../overwire/extension/scripts/capture-web-screenshots.mjs',
);
const result = spawnSync(process.execPath, [script], {
  stdio: 'inherit',
  env: {
    ...process.env,
    DETOUR_WEB_SHOTS: path.resolve(__dirname, '../public/screenshots'),
    DETOUR_STORE_ASSETS: path.resolve(
      __dirname,
      '../../../overwire/docs/distribution/store-assets',
    ),
  },
});
process.exit(result.status ?? 1);
