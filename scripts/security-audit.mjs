import { spawnSync } from 'node:child_process';

const acceptedAdvisories = new Set([
  // Next.js 15.5.22 pins these transitive packages. Remove each exception as
  // soon as the maintained Next.js release line includes the patched version.
  'GHSA-qx2v-qp2m-jg93',
  'GHSA-6g55-p6wh-862q',
  'GHSA-r28c-9q8g-f849',
  'GHSA-f88m-g3jw-g9cj',
]);

const npmCli = process.env.npm_execpath;
const command = npmCli ? process.execPath : 'npm';
const commandArgs = npmCli
  ? [npmCli, 'audit', '--omit=dev', '--json']
  : ['audit', '--omit=dev', '--json'];
const result = spawnSync(command, commandArgs, {
  encoding: 'utf8',
});

let report;
try {
  report = JSON.parse(result.stdout);
} catch {
  console.error('Security audit did not return valid JSON.');
  if (result.error) console.error(result.error.message);
  if (result.stderr) console.error(result.stderr.trim());
  process.exit(1);
}

const findings = [];
for (const [packageName, vulnerability] of Object.entries(report.vulnerabilities ?? {})) {
  for (const advisory of vulnerability.via ?? []) {
    if (typeof advisory === 'string') continue;
    if (!['high', 'critical'].includes(advisory.severity)) continue;

    const advisoryId = advisory.url?.split('/').pop() ?? String(advisory.source);
    findings.push({
      packageName,
      advisoryId,
      severity: advisory.severity,
      accepted: acceptedAdvisories.has(advisoryId),
    });
  }
}

const blocking = findings.filter((finding) => !finding.accepted || finding.severity === 'critical');
const totals = report.metadata?.vulnerabilities ?? {};

console.log(
  `Production audit: ${totals.critical ?? 0} critical, ${totals.high ?? 0} high, ${totals.moderate ?? 0} moderate.`,
);

for (const finding of findings) {
  console.log(
    `${finding.accepted ? 'accepted-temporarily' : 'blocking'} ${finding.severity} ${finding.advisoryId} (${finding.packageName})`,
  );
}

if (blocking.length > 0) {
  console.error('Security audit failed: a new or critical production advisory requires review.');
  process.exit(1);
}

console.log('Security audit passed: no unapproved high or critical production advisories.');
