import fs from "node:fs";
import path from "node:path";

async function getGoogleAccessToken() {
  const adcPath = path.join(process.env.APPDATA || "", "gcloud", "application_default_credentials.json");
  if (!fs.existsSync(adcPath)) {
    throw new Error(`ADC não encontrado em: ${adcPath}`);
  }
  const adc = JSON.parse(fs.readFileSync(adcPath, "utf8"));
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: adc.client_id,
      client_secret: adc.client_secret,
      refresh_token: adc.refresh_token,
      grant_type: "refresh_token"
    })
  });
  if (!tokenRes.ok) throw new Error(`Falha OAuth2: ${await tokenRes.text()}`);
  const data = await tokenRes.json();
  return data.access_token;
}

async function fetchFile(fileId, outPath = null) {
  const token = await getGoogleAccessToken();
  const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!metaRes.ok) throw new Error(`Erro ao obter metadados: ${await metaRes.text()}`);
  const meta = await metaRes.json();

  let contentUrl;
  const isDoc = meta.mimeType === "application/vnd.google-apps.document";
  const isSheet = meta.mimeType === "application/vnd.google-apps.spreadsheet";

  if (isDoc) {
    contentUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`;
  } else if (isSheet) {
    contentUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/csv`;
  } else {
    contentUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  }

  const res = await fetch(contentUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`Erro ao baixar conteúdo: ${await res.text()}`);

  if (isDoc || isSheet) {
    const text = await res.text();
    if (outPath) {
      fs.writeFileSync(outPath, text, "utf8");
      console.log(`Salvo em ${outPath} (${text.length} caracteres)`);
    } else {
      console.log(text.slice(0, 2000));
    }
  } else {
    const buf = Buffer.from(await res.arrayBuffer());
    if (outPath) {
      fs.writeFileSync(outPath, buf);
      console.log(`Binário salvo em ${outPath} (${buf.length} bytes)`);
    } else {
      console.log(`Binário baixado: ${meta.name} (${buf.length} bytes)`);
    }
  }
}

const fileId = process.argv[2];
const out = process.argv[3];
if (!fileId) {
  console.log("Uso: node drive_fetch.mjs <FILE_ID> [CAMINHO_DESTINO]");
  process.exit(1);
}

try {
  await fetchFile(fileId, out);
} catch (error) {
  console.error(error);
}
