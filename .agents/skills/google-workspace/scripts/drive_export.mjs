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
    throw new Error(`Falha OAuth2 (${tokenRes.status}): ${await tokenRes.text()}`);
  }
  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log("Uso: node drive_export.mjs <FILE_ID> [ARQUIVO_SAIDA]");
    process.exit(1);
  }

  const fileId = args[0];
  const outputPath = args[1];

  const token = await getGoogleAccessToken();

  // 1. Obter metadados do arquivo
  const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!metaRes.ok) {
    console.error(`Erro ao buscar arquivo: ${metaRes.status} ${await metaRes.text()}`);
    process.exit(1);
  }

  const meta = await metaRes.json();
  console.log(`📄 Arquivo: "${meta.name}" (MIME: ${meta.mimeType})`);

  let contentUrl;
  if (meta.mimeType === "application/vnd.google-apps.document") {
    contentUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`;
  } else {
    contentUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  }

  const contentRes = await fetch(contentUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!contentRes.ok) {
    console.error(`Erro ao baixar conteúdo: ${contentRes.status} ${await contentRes.text()}`);
    process.exit(1);
  }

  const text = await contentRes.text();

  if (outputPath) {
    fs.writeFileSync(outputPath, text, "utf8");
    console.log(`✅ Conteúdo exportado com sucesso para: ${outputPath} (${text.length} caracteres)`);
  } else {
    console.log("\n--- CONTEÚDO EXPORTADO ---");
    console.log(text.slice(0, 1500) + (text.length > 1500 ? "\n... [TRUNCADO PARA EXIBIÇÃO]" : ""));
  }
}

main().catch(err => {
  console.error("Erro no exportador:", err.message);
  process.exit(1);
});
