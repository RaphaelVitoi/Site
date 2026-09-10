import { Unzip, UnzipInflate, strFromU8 } from 'fflate';

const MAX_SETTINGS = 5 * 1024 * 1024;

/** Read only the root settings entry. Solver binaries are never decompressed. */
export function extractHrcSettings(bytes: Uint8Array): string {
  let result: string | undefined;
  let failure: Error | undefined;
  const unzip = new Unzip(file => {
    if (file.name !== 'settings.json') return;
    if (file.originalSize !== undefined && file.originalSize > MAX_SETTINGS) throw new Error('settings.json excede 5 MB.');
    const chunks: Uint8Array[] = [];
    let size = 0;
    file.ondata = (error, data, final) => {
      if (error) { failure = error; return; }
      size += data.length;
      if (size > MAX_SETTINGS) { file.terminate(); failure = new Error('settings.json excede 5 MB.'); return; }
      chunks.push(data);
      if (final) {
        const output = new Uint8Array(size);
        let offset = 0;
        for (const chunk of chunks) { output.set(chunk, offset); offset += chunk.length; }
        result = strFromU8(output).replace(/^\uFEFF/, '');
      }
    };
    file.start();
  });
  unzip.register(UnzipInflate);
  try {
    for (let offset = 0; offset < bytes.length; offset += 1024) {
      unzip.push(bytes.subarray(offset, offset + 1024), offset + 1024 >= bytes.length);
      if (failure) throw failure;
      if (result !== undefined) return result;
    }
  } catch (error) {
    throw new Error(`Não foi possível abrir o cenário HRC: ${error instanceof Error ? error.message : 'arquivo inválido'}`);
  }
  throw new Error('O arquivo HRC não contém settings.json na raiz. Exporte JSON (Hand Config) pelo HRC.');
}
