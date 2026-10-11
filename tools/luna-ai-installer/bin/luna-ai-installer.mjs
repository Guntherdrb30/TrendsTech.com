#!/usr/bin/env node
/**
 * LUNA AI Auto Installer - safe, read-only v0.1 scanner.
 * No network calls, credentials, file edits or deployment.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ignored = new Set(['node_modules', '.git', '.next', 'dist', 'build', 'coverage', '.turbo', 'vendor', '.vercel']);
const allowed = /\.(?:js|jsx|ts|tsx|mjs|cjs|py)$/;
const rules = [
  { provider: 'openai', kind: 'sdk', pattern: /(?:from\s*['"]openai['"]|require\(['"]openai['"]\)|new\s+OpenAI\s*\()/ },
  { provider: 'anthropic', kind: 'sdk', pattern: /(?:@anthropic-ai\/sdk|new\s+Anthropic\s*\()/ },
  { provider: 'google', kind: 'sdk', pattern: /(?:@google\/generative-ai|@google\/genai|GoogleGenerativeAI)/ },
  { provider: 'vercel-ai', kind: 'sdk', pattern: /(?:from\s*['"]ai['"]|require\(['"]ai['"]\))/ },
  { provider: 'openai', kind: 'http', pattern: /api\.openai\.com\/v1/ },
  { provider: 'anthropic', kind: 'http', pattern: /api\.anthropic\.com\/v1/ },
  { provider: 'google', kind: 'http', pattern: /generativelanguage\.googleapis\.com/ },
];
const MAX_FILES = 12000;
const MAX_SIZE = 512 * 1024;

async function scan(root) {
  const findings = [];
  let visited = 0;
  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (visited >= MAX_FILES) throw new Error('Scan limit reached (12000 files)');
      if (entry.name.startsWith('.') && entry.isDirectory()) continue;
      if (ignored.has(entry.name)) continue;
      const full = join(dir, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) { await walk(full); continue; }
      if (!entry.isFile() || !allowed.test(entry.name)) continue;
      visited++;
      const { size } = await import('node:fs/promises').then(fs => fs.stat(full));
      if (size > MAX_SIZE) continue;
      const lines = (await readFile(full, 'utf8')).split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        for (const rule of rules) {
          if (rule.pattern.test(lines[i])) {
            findings.push({
              path: relative(root, full).replaceAll('\\', '/'),
              line: i + 1,
              provider: rule.provider,
              integration: rule.kind,
              confidence: 'medium',
              alreadyInstrumented: /trackAiCall|forwardAiUsageToLuna/.test(lines[i]),
              // Deliberately do not include source code, which may contain secrets.
            });
          }
        }
      }
    }
  }
  await walk(root);
  return { schemaVersion: 1, scannedFiles: visited, findings };
}

function usage() {
  process.stdout.write('Usage: luna-ai-installer scan --project <path> [--output <report.json>]\n');
}

export async function main(args = process.argv.slice(2)) {
  const [command, ...rest] = args;
  if (command !== 'scan' || rest.includes('--help')) { usage(); return command === '--help' || rest.includes('--help') ? 0 : 2; }
  const projectIndex = rest.indexOf('--project');
  const outputIndex = rest.indexOf('--output');
  const project = projectIndex >= 0 ? rest[projectIndex + 1] : '.';
  if (!project || project.startsWith('--')) throw new Error('Missing project path');
  const result = await scan(resolve(project));
  const json = JSON.stringify(result, null, 2) + '\n';
  if (outputIndex >= 0) {
    const output = rest[outputIndex + 1];
    if (!output || output.startsWith('--')) throw new Error('Missing output path');
    await writeFile(resolve(output), json, { flag: 'wx', mode: 0o600 });
    process.stdout.write(`Report written: ${resolve(output)}\n`);
  } else process.stdout.write(json);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().then(code => { process.exitCode = code; }).catch(err => {
    process.stderr.write(`Scan failed: ${err instanceof Error ? err.message : 'unknown'}\n`);
    process.exitCode = 1;
  });
}
