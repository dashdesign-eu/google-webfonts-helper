import { build } from 'esbuild';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

// Only this repository's generated distribution is replaced. Font caches live
// outside dist in production and are never touched by a frontend build.
await rm('dist', { recursive: true, force: true });
await mkdir('dist/public/app', { recursive: true });
execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', '--skipLibCheck'], { stdio: 'inherit' });
await cp('test', 'dist/test', { recursive: true });
await cp('client/static', 'dist/public', { recursive: true });
const output = await build({ entryPoints: ['client/native/app.js'], bundle: true,
  format: 'esm', target: ['es2022'], minify: true, write: false });
const bytes = output.outputFiles[0].contents;
const name = `app/${createHash('sha256').update(bytes).digest('hex').slice(0, 12)}.js`;
await writeFile(`dist/public/${name}`, bytes);
const html = await readFile('client/index.html', 'utf8');
await writeFile('dist/public/index.html', html.replace('@@APP_SCRIPT@@', name));
