/** @jest-environment node */
import { zipSync, strToU8 } from 'fflate';
import { extractHrcSettings } from '../../lib/hrcArchive';
import settings from './fixtures/hrc-native-settings.json';

test('extracts HRC settings and tree without decoding solver state', () => {
  const raw = JSON.stringify(settings);
  const archive = zipSync({ 'settings.json': strToU8(raw), 'gametree.dat': new Uint8Array([1,2,3]), 'nodedata.dat': new Uint8Array(100000) });
  expect(JSON.parse(extractHrcSettings(archive))).toEqual(settings);
});
test('rejects invalid archives, missing root settings and oversized configuration', () => {
  expect(() => extractHrcSettings(new Uint8Array([1,2,3]))).toThrow();
  expect(() => extractHrcSettings(zipSync({ 'nested/settings.json': strToU8('{}') }))).toThrow('não contém');
  expect(() => extractHrcSettings(zipSync({ 'settings.json': new Uint8Array(5 * 1024 * 1024 + 1) }))).toThrow('excede');
});
