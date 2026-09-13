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

async function search(queryTerm, pageSize = 20) {
  const token = await getGoogleAccessToken();
  const q = `trashed = false and (name contains '${queryTerm}' or fullText contains '${queryTerm}')`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&pageSize=${pageSize}&fields=files(id,name,mimeType,size,modifiedTime,webViewLink)&spaces=drive`;
  
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`Erro na busca Drive: ${await res.text()}`);
  const data = await res.json();
  return data.files || [];
}

const term = process.argv[2] || "PMev";
const limit = Number.parseInt(process.argv[3] || "15", 10);

try {
  const files = await search(term, limit);
  console.log(`\n=== RESULTADOS DA BUSCA GOOGLE DRIVE: "${term}" (${files.length} itens) ===\n`);
  for (const f of files) {
    console.log(`- [${f.mimeType}] ${f.name}`);
    console.log(`  ID: ${f.id} | Link: ${f.webViewLink}\n`);
  }
} catch (error) {
  console.error(error);
}
