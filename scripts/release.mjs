// npm run release:check: say what merging this commit to main would release, and fail if that release is invalid.
// node scripts/release.mjs --publish: run by .github/workflows/release.yml once CI has passed on main. Creates the tag
// and GitHub release for the version in package.json, with its CHANGELOG entry as the notes. Does nothing if that
// version is already tagged, and never moves or deletes a tag (CONVENTIONS.md, Versioning).
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ROOT } from './lib.mjs';

const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;
const parse = (v) => SEMVER.exec(v)?.slice(1).map(Number);
const compare = (a, b) => a.reduce((d, n, i) => d || n - b[i], 0);
const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
const fail = (message) => {
  console.error(`::error::${message}`);
  process.exit(1);
};

/** The body of the CHANGELOG entry for a version: everything between its heading and the next one. */
function changelogEntry(changelog, version) {
  const lines = changelog.split('\n');
  const start = lines.findIndex((l) => l.startsWith(`## [${version}]`));
  if (start < 0) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => l.startsWith('## ['));
  return (end < 0 ? rest : rest.slice(0, end)).join('\n').trim();
}

const version = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version;
const current = parse(version);
if (!current) fail(`package.json version "${version}" is not x.y.z.`);
const tag = `v${version}`;

const tags = git('tag', '--list', 'v*').split('\n').filter(Boolean);
if (tags.length === 0) fail('No v* tags found. The checkout needs the tags (fetch-depth: 0, or git fetch --tags).');

if (tags.includes(tag)) {
  console.log(`No release: ${tag} is already tagged. Bump the version in package.json to release.`);
  process.exit(0);
}

const latest = tags.map((t) => [t, parse(t.slice(1))]).filter(([, v]) => v).sort(([, a], [, b]) => compare(b, a))[0];
if (latest && compare(current, latest[1]) <= 0) fail(`package.json says ${version}, which is not newer than the latest tag, ${latest[0]}.`);

const notes = changelogEntry(readFileSync(join(ROOT, 'CHANGELOG.md'), 'utf8'), version);
if (!notes) fail(`CHANGELOG.md has no "## [${version}]" entry, or it is empty.`);

if (!process.argv.includes('--publish')) {
  console.log(`Merging this releases ${tag} (after ${latest[0]}). Release notes:\n\n${notes}`);
  process.exit(0);
}

const sha = process.env.RELEASE_SHA || git('rev-parse', 'HEAD');
if (git('rev-parse', 'HEAD') !== sha) fail(`The checkout is at ${git('rev-parse', 'HEAD')}, not ${sha}, the commit CI passed on.`);
const file = join(mkdtempSync(join(tmpdir(), 'release-')), 'notes.md');
writeFileSync(file, `${notes}\n`);
execFileSync('gh', ['release', 'create', tag, '--target', sha, '--title', tag, '--notes-file', file], { cwd: ROOT, stdio: 'inherit' });
console.log(`Released ${tag} at ${sha}.`);
