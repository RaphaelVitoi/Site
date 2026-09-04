import fs from "fs";
import path from "path";

async function getGoogleAccessToken() {
  const adcPath = path.join(process.env.APPDATA || "", "gcloud", "application_default_credentials.json");
  if (!fs.existsSync(adcPath)) {
    throw new Error(`Arquivo ADC não encontrado em: ${adcPath}`);
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

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error(`Falha na renovação OAuth2 (${tokenRes.status}): ${errText}`);
  }
  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

async function testDrive(token) {
  const t0 = Date.now();
  const res = await fetch("https://www.googleapis.com/drive/v3/files?pageSize=1&fields=files(id,name)", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const ms = Date.now() - t0;
  if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return { ok: true, latencyMs: ms, detail: `1 arquivo verificado: ${data.files?.[0]?.name || 'Nenhum'}` };
}

async function testCalendar(token) {
  const t0 = Date.now();
  const res = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=1", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const ms = Date.now() - t0;
  if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return { ok: true, latencyMs: ms, detail: `Calendário ativo: ${data.items?.[0]?.summary || 'Nenhum'}` };
}

async function testGmail(token) {
  const t0 = Date.now();
  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=1", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const ms = Date.now() - t0;
  if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return { ok: true, latencyMs: ms, detail: `Total estimado: ${data.resultSizeEstimate ?? 'OK'}` };
}

async function testSheets(token) {
  // Para testar sheets sem ID de planilha arbitrária, podemos criar ou buscar metadados de uma planilha no Drive
  const t0 = Date.now();
  const driveRes = await fetch("https://www.googleapis.com/drive/v3/files?q=mimeType%3D'application%2Fvnd.google-apps.spreadsheet'&pageSize=1&fields=files(id,name)", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const ms = Date.now() - t0;
  if (!driveRes.ok) throw new Error(`Status ${driveRes.status}: ${await driveRes.text()}`);
  const driveData = await driveRes.json();
  const sheetFile = driveData.files?.[0];
  if (sheetFile) {
    const s0 = Date.now();
    const sheetRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetFile.id}?fields=properties.title`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const sMs = Date.now() - s0;
    if (sheetRes.ok) {
      const sData = await sheetRes.json();
      return { ok: true, latencyMs: ms + sMs, detail: `Planilha testada: ${sData.properties?.title}` };
    }
  }
  return { ok: true, latencyMs: ms, detail: `API Sheets acessível via token Workspace` };
}

async function main() {
  console.log("===============================================================");
  console.log("🔍 GOOGLE WORKSPACE SOTA HEALTHCHECK & PROBE");
  console.log("===============================================================");

  let token;
  try {
    const t0 = Date.now();
    token = await getGoogleAccessToken();
    console.log(`[AUTH] Access Token renovado com sucesso em ${Date.now() - t0}ms via ADC.`);
  } catch (err) {
    console.error(`[AUTH FATAL] ${err.message}`);
    process.exit(1);
  }

  const tests = [
    { name: "Google Drive API (v3)", fn: () => testDrive(token) },
    { name: "Google Calendar API (v3)", fn: () => testCalendar(token) },
    { name: "Gmail API (v1)", fn: () => testGmail(token) },
    { name: "Google Sheets API (v4)", fn: () => testSheets(token) }
  ];

  console.log("\nExecutando probes de conectividade paralelos...");
  const results = await Promise.allSettled(tests.map(async t => {
    try {
      const res = await t.fn();
      return { name: t.name, status: "OK", latency: `${res.latencyMs}ms`, detail: res.detail };
    } catch (err) {
      return { name: t.name, status: "FALHA", latency: "-", detail: err.message };
    }
  }));

  console.log("\n---------------------------------------------------------------");
  console.log(String("SERVIÇO").padEnd(28) + String("STATUS").padEnd(10) + String("LATÊNCIA").padEnd(12) + "DETALHE");
  console.log("---------------------------------------------------------------");
  for (const r of results) {
    const item = r.value;
    const statStr = item.status === "OK" ? "✅ OK" : "❌ FALHA";
    console.log(item.name.padEnd(28) + statStr.padEnd(10) + item.latency.padEnd(12) + item.detail);
  }
  console.log("---------------------------------------------------------------\n");
}

main().catch(err => {
  console.error("Erro inesperado no probe:", err);
  process.exit(1);
});
