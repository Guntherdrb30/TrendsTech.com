import { spawnSync } from 'node:child_process';

const acceptedAdvisories = new Set();

const npmCli = process.env.npm_execpath;
const command = npmCli ? process.execPath : 'npm';
const commandArgs = npmCli
  ? [npmCli, 'audit', '--json']
  : ['audit', '--json'];
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

if (report.error || !report.metadata?.vulnerabilities || !report.vulnerabilities) {
  console.error('Security audit failed: incomplete or errored dependency report.');
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
  `Dependency audit: ${totals.critical ?? 0} critical, ${totals.high ?? 0} high, ${totals.moderate ?? 0} moderate.`,
);

for (const finding of findings) {
  console.log(
    `${finding.accepted ? 'accepted-temporarily' : 'blocking'} ${finding.severity} ${finding.advisoryId} (${finding.packageName})`,
  );
}

if (blocking.length > 0 || (totals.high ?? 0) > 0 || (totals.critical ?? 0) > 0) {
  console.error('Security audit failed: a new or critical dependency advisory requires review.');
  process.exit(1);
}

console.log('Security audit passed: no unapproved high or critical dependency advisories.');
