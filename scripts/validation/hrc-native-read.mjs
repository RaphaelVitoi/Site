import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

// Explicit installation and output paths keep the user's HRC workspace untouched.
const [hrc, jdk, destination] = process.argv.slice(2);
if (!hrc || !jdk || !destination) throw new Error('Usage: node scripts/validation/hrc-native-read.mjs <HRC-directory> <JDK-directory> <output-directory>');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const out = path.resolve(destination);
if (fs.existsSync(out)) throw new Error('Use a new output directory; existing evidence is never overwritten.');
const relativeOutput = path.relative(path.resolve(hrc), out);
if (!relativeOutput.startsWith('..' + path.sep) && !path.isAbsolute(relativeOutput)) throw new Error('Output must stay outside the HRC installation.');
const plugins = path.join(path.resolve(hrc), 'plugins');
const jar = path.join(plugins, 'net.holdemresources.calculator_4.1.0.202603231401.jar');
if (!fs.existsSync(jar)) throw new Error('This probe is bound to HRC 4.1.0.202603231401; inspect class contracts before supporting another build.');
const require = createRequire(import.meta.url);
const ts = require('typescript');
const sourceRoot = path.join(root, 'frontend/src') + path.sep;
require.extensions['.ts'] = (module, filename) => {
  if (!filename.startsWith(sourceRoot)) throw new Error('Only repository frontend TypeScript may be loaded by this probe.');
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText, filename);
};
const { parseTournamentSnapshot, normalizeTournamentPlayers } = require(path.join(sourceRoot, 'lib/tournamentContext.ts'));
const { readHRCPrizes } = require(path.join(sourceRoot, 'lib/hrcPrizes.ts'));
const { generateHRCHandConfig } = require(path.join(sourceRoot, 'lib/hrcFormat.ts'));
const { parseHRCStructures } = require(path.join(sourceRoot, 'lib/hrcStructure.ts'));
const { ggHand } = require(path.join(sourceRoot, 'tests/simulator/fixtures/handHistories.ts'));
const fixtures = path.join(sourceRoot, 'tests/simulator/fixtures');
fs.mkdirSync(out, { recursive: true });
const exe = name => path.join(path.resolve(jdk), 'bin', name + (process.platform === 'win32' ? '.exe' : ''));
function run(name, args, expected = 0) {
  const result = spawnSync(exe(name), args, { encoding: 'utf8', windowsHide: true, timeout: 60000 });
  if (result.error) throw result.error;
  if (result.status !== expected) throw new Error(`${name}: exit ${result.status}\n${result.stderr}`);
  return result;
}
run('javac', ['-cp', path.join(plugins, '*'), '-d', out, path.join(root, 'scripts/validation/HrcNativeReadProbe.java')]);
const classpath = out + path.delimiter + path.join(plugins, '*');
const summaries = [];
const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function nativeRead(name, raw) {
  const file = path.join(out, name + '.json');
  fs.writeFileSync(file, raw);
  const result = run('java', ['-cp', classpath, 'HrcNativeReadProbe', file]);
  fs.writeFileSync(path.join(out, name + '.native.json'), result.stdout);
  return JSON.parse(result.stdout);
}
const rawStructure = fs.readFileSync(path.join(fixtures, 'hrc-structure-pko.json'), 'utf8');
const nativeCollection = nativeRead('structure-pko-original', rawStructure);
const localStructure = parseHRCStructures(rawStructure)[0];
assert.deepEqual(nativeCollection.structures[0].prizes, localStructure.fullPrizes);
assert.equal(nativeCollection.structures[0].chips, localStructure.chips);
assert.equal(nativeCollection.structures[0].bountyType, localStructure.bountyType);
assert.equal(nativeCollection.structures[0].progressiveFactor, localStructure.progressiveFactor);
summaries.push({ case: 'structure-pko-original', paidPlaces: nativeCollection.structures[0].paidPlaces, pool: nativeCollection.structures[0].prizePool,
  originalName: localStructure.name, nativeName: nativeCollection.structures[0].name, sourceSha256: hash(path.join(fixtures, 'hrc-structure-pko.json')) });

const original = JSON.parse(fs.readFileSync(path.join(fixtures, 'hrc-native-settings.json'), 'utf8'));
const expanded = structuredClone(original);
expanded.handdata.stacks = Array.from({ length: 8 }, (_, i) => (30 + i) * 100000);
expanded.eqmodel.otherstacks = Array.from({ length: 115 }, (_, i) => (20 + i) * 1000);
expanded.eqmodel.structure.chips = expanded.handdata.stacks.reduce((s, v) => s + v / 100, 0) + expanded.eqmodel.otherstacks.reduce((s, v) => s + v, 0);
const ft = JSON.parse(fs.readFileSync(path.join(fixtures, 'hrc-native-ft-settings.json'), 'utf8'));
// Derived consistency case only; the inconsistent native fixture remains unchanged.
ft.eqmodel.structure.chips = ft.handdata.stacks.reduce((s, v) => s + v / 100, 0);
const cases = [
  ['native-mtt-13', JSON.stringify(original)],
  ['synthetic-mtt-123', JSON.stringify(expanded)],
  ['derived-ft-9', JSON.stringify(ft)],
  ['synthetic-gg-hh-3', ggHand],
];
let validConfig;
for (const [name, raw] of cases) {
  const snapshot = parseTournamentSnapshot(raw);
  const population = normalizeTournamentPlayers(snapshot);
  const prizes = snapshot.prizes ?? [5000, 3000, 2000];
  const exported = generateHRCHandConfig(population, prizes, {
    snapshot, selection: { room: snapshot.room ?? 'PokerStars', playerIds: snapshot.suggestedPlayerIds, participantIds: [] },
  });
  const config = JSON.parse(exported);
  const native = nativeRead(name, exported);
  assert.deepEqual(native.handdata.stacks, config.handdata.stacks);
  assert.deepEqual(native.handdata.blinds, config.handdata.blinds);
  assert.equal(native.structure.chips, config.eqmodel.structure.chips);
  assert.deepEqual(native.structure.prizes, readHRCPrizes(config.eqmodel.structure.prizes, native.structure.paidPlaces).payouts);
  assert.equal(native.otherstacks.length + native.handdata.stacks.length, population.length);
  summaries.push({ case: name, table: native.handdata.stacks.length, outside: native.otherstacks.length,
    chips: native.structure.chips, paidPlaces: native.structure.paidPlaces, exportSha256: hash(path.join(out, name + '.json')) });
  validConfig = config;
}
// Counterexample: native enum deserialization must not silently count as acceptance.
validConfig.handdata.anteType = 'INVALID_ANTE_TYPE';
const negative = path.join(out, 'invalid-ante.json');
fs.writeFileSync(negative, JSON.stringify(validConfig));
const rejected = run('java', ['-cp', classpath, 'HrcNativeReadProbe', negative], 1);
assert.match(rejected.stderr, /Native hand roundtrip changed field: anteType/);
const summary = { generatedAt: new Date().toISOString(), hrcJarSha256: hash(jar),
  scope: 'Native HRC hand deserialization and structure parser only; no wizard, tree validation, solve or EV certification.',
  negativeControlRejected: true, cases: summaries };
fs.writeFileSync(path.join(out, 'summary.json'), JSON.stringify(summary, null, 2));
process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
