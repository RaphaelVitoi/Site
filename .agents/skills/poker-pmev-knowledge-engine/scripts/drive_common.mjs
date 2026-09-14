// Regras comuns aos scripts de Drive: raizes de escrita, codigos de saida, escape de consulta e ADC.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const EXIT = Object.freeze({ OK: 0, NOT_FOUND: 1, OUTSIDE_WRITE_ROOTS: 5, USAGE: 6, REMOTE: 7 });

export const REPO_ROOT = path.resolve(fileURLToPath(new URL("../../../../", import.meta.url)));
export const WRITE_ROOTS = [path.join(REPO_ROOT, "docs", "research", "pmev"), path.join(REPO_ROOT, "scratch")];

export class SkillError extends Error {
  constructor(message, exitCode) {
    super(message);
    this.exitCode = exitCode;
  }
}

const normalizar = (p) => (process.platform === "win32" ? p.toLowerCase() : p);

/** Destino absoluto dentro de uma raiz permitida. Relativo resolve pela raiz do repositorio, nunca pelo cwd. */
export function resolveWriteTarget(target, roots = WRITE_ROOTS) {
  const absoluto = path.resolve(path.isAbsolute(target) ? target : path.join(REPO_ROOT, target));
  const dentro = roots.some((raiz) => {
    const relativo = path.relative(normalizar(path.resolve(raiz)), normalizar(absoluto));
    return relativo !== "" && !relativo.startsWith("..") && !path.isAbsolute(relativo);
  });
  if (!dentro) {
    throw new SkillError(`destino fora das raizes de escrita: ${absoluto}`, EXIT.OUTSIDE_WRITE_ROOTS);
  }
  return absoluto;
}

/** Literal de string da sintaxe de consulta do Drive v3: escapa barra invertida e aspas simples. */
export function escapeDriveQuery(term) {
  return String(term).replaceAll("\\", String.raw`\\`).replaceAll("'", String.raw`\'`);
}

export function isValidFileId(id) {
  return typeof id === "string" && /^[A-Za-z0-9_-]+$/.test(id);
}

/** Token de acesso a partir do ADC local. Nenhum valor do ADC nem o token sao impressos. */
export async function getGoogleAccessToken() {
  const adcPath = path.join(process.env.APPDATA || "", "gcloud", "application_default_credentials.json");
  if (!fs.existsSync(adcPath)) {
    throw new SkillError(`ADC nao encontrado em ${adcPath}`, EXIT.USAGE);
  }
  const adc = JSON.parse(fs.readFileSync(adcPath, "utf8"));
  const resposta = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: adc.client_id,
      client_secret: adc.client_secret,
      refresh_token: adc.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  if (!resposta.ok) throw new SkillError(`falha OAuth2: HTTP ${resposta.status}`, EXIT.REMOTE);
  return (await resposta.json()).access_token;
}

/** Executa `principal` e converte qualquer falha em mensagem no stderr com codigo de saida nao zero. */
export async function run(principal) {
  try {
    await principal();
    process.exitCode = EXIT.OK;
  } catch (error_) {
    const codigo = error_ instanceof SkillError ? error_.exitCode : EXIT.REMOTE;
    console.error(`ERRO ${codigo}: ${error_.message}`);
    process.exitCode = codigo;
  }
}
