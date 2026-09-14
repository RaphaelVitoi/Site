// Busca no Google Drive v3. Uso: node drive_search.mjs "termo" [maxResults 1-100]
import { EXIT, SkillError, escapeDriveQuery, getGoogleAccessToken, run } from "./drive_common.mjs";

await run(async () => {
  const termo = process.argv[2];
  const limite = Number.parseInt(process.argv[3] ?? "15", 10);
  if (!termo?.trim()) throw new SkillError('uso: node drive_search.mjs "termo" [maxResults 1-100]', EXIT.USAGE);
  if (!Number.isInteger(limite) || limite < 1 || limite > 100) {
    throw new SkillError("maxResults deve ser inteiro entre 1 e 100", EXIT.USAGE);
  }

  const token = await getGoogleAccessToken();
  const literal = escapeDriveQuery(termo);
  const q = `trashed = false and (name contains '${literal}' or fullText contains '${literal}')`;
  const url =
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&pageSize=${limite}` +
    "&fields=files(id,name,mimeType,size,modifiedTime,webViewLink)&spaces=drive";
  const resposta = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!resposta.ok) throw new SkillError(`busca no Drive falhou: HTTP ${resposta.status}`, EXIT.REMOTE);
  const arquivos = (await resposta.json()).files || [];

  console.log(`${arquivos.length} resultado(s) para "${termo}"`);
  for (const f of arquivos) {
    console.log(`- [${f.mimeType}] ${f.name}\n  ID: ${f.id} | ${f.webViewLink}`);
  }
});
