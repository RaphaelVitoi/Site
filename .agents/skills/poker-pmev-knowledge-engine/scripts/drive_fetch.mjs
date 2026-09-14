// Download/exportacao do Google Drive v3. Uso: node drive_fetch.mjs <FILE_ID> [DESTINO]
// DESTINO precisa estar em docs/research/pmev/ ou scratch/; e validado antes de qualquer rede.
import fs from "node:fs";
import path from "node:path";
import { EXIT, SkillError, getGoogleAccessToken, isValidFileId, resolveWriteTarget, run } from "./drive_common.mjs";

await run(async () => {
  const fileId = process.argv[2];
  if (!isValidFileId(fileId)) throw new SkillError("uso: node drive_fetch.mjs <FILE_ID> [DESTINO]", EXIT.USAGE);
  const destino = process.argv[3] ? resolveWriteTarget(process.argv[3]) : null;

  const token = await getGoogleAccessToken();
  const cabecalho = { headers: { Authorization: `Bearer ${token}` } };
  const base = `https://www.googleapis.com/drive/v3/files/${fileId}`;
  const meta = await fetch(`${base}?fields=id,name,mimeType,size`, cabecalho);
  if (meta.status === 404) throw new SkillError(`arquivo ${fileId} nao encontrado no Drive`, EXIT.NOT_FOUND);
  if (!meta.ok) throw new SkillError(`metadados falharam: HTTP ${meta.status}`, EXIT.REMOTE);
  const { name, mimeType } = await meta.json();

  const exportacao = {
    "application/vnd.google-apps.document": "text/plain",
    "application/vnd.google-apps.spreadsheet": "text/csv",
  }[mimeType];
  const url = exportacao ? `${base}/export?mimeType=${encodeURIComponent(exportacao)}` : `${base}?alt=media`;
  const conteudo = await fetch(url, cabecalho);
  if (!conteudo.ok) throw new SkillError(`download falhou: HTTP ${conteudo.status}`, EXIT.REMOTE);

  const bytes = Buffer.from(await conteudo.arrayBuffer());
  if (!destino) {
    console.log(exportacao ? bytes.toString("utf8").slice(0, 2000) : `${name}: ${bytes.length} bytes (sem destino, nada gravado)`);
    return;
  }
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, bytes);
  console.log(`gravado ${destino} (${bytes.length} bytes)`);
});
