---
name: preview-sota
description: "Previews e compartilhamento de apps em execucao — decisor entre preview local (browser_preview do harness), preview Devin Cloud (URL privada por sessao), tunel SSH/localhost e Devin Apps. Use quando um app dev server estiver rodando e o Tier 0 precisar ver/interagir, ou quando uma sessao Devin cloud precisar expor portas."
argument-hint: "[porta/app alvo ou contexto de compartilhamento]"
allowed-tools:
  - read
  - exec
triggers:
  - user
  - model
metadata:
  hermes:
    tags: ["preview", "dev-server", "tunnel", "sharing", "localhost"]
    category: devops
    related_skills: ["e2e-video-proof", "computer-use-local", "devin-managed-ops"]
---

# Preview SOTA — decisor de "como o humano ve o app rodando"

Referencia: docs.devin.ai/work-with-devin/browser-previews e
/desktop/previews. No ecossistema local existem **tres** mecanismos com
custos e alcances diferentes — escolher errado significa ou expor demais
ou esconder demais.

## 0. As tres rotas

| Rota | Alcance | Custo | Quando |
| :--- | :--- | :--- | :--- |
| **`browser_preview` (harness local)** | so a maquina do Tier 0, browser real dele | zero | dev server local (Vite :5173, FastAPI, etc.) — e o canal mais rico: o usuario ve, clica, e te manda o elemento/console de volta |
| **Preview Devin Cloud** | org Devin autenticada | ACU da sessao | app rodando numa sessao Devin cloud que precisa ser vista por teammate ou revisada fora da maquina local |
| **Tunel localhost** (`devin forward`, `ssh -L`) | so o computador que roda o tunel | zero alem da sessao | app exige `localhost` de verdade — IdP/OAuth que so tem `localhost` registrado, service worker, certificado especifico |

**Regra de ouro:** preview e para *ver*, nao para *provar*. Prova e2e
com evidencia vai por `e2e-video-proof` (video + screenshots). Preview
aberta sem relato de resultado nao e verificacao.

## 1. Preview local (browser_preview)

- O servidor precisa ja estar rodando; a tool recebe `http://localhost:<porta>`.
- O usuario interage normalmente e pode te devolver: elemento DOM
  selecionado (com componente/fonte), console do browser, ou print.
  **Trate esse retorno como input de primeira classe** — e o equivalente
  local do "annotate element" da Preview tab do Devin.
- Multiplas portas: uma preview por servidor; nao tente multiplexar —
  o Devin resolve isso com menu de portas porque e infraestrutura deles.

## 2. Preview Devin Cloud — o que a doc ensina e como aplicar

- URL `https://<nome>--<id>.preview.devinapps.com`, privada, exige login
  Devin, segue a permissão da sessão. **Nada e publico** — mas qualquer
  membro da org com acesso a sessoes abre. Para org solo, equivale a
  privado.
- **Rewrite de portas:** `http://localhost:8000` dentro do app e
  reescrito para a porta exposta; WebSocket tambem. Host/Origin chegam
  ao app como `localhost` — dev servers que checam host funcionam sem
  config extra.
- **Armadilha do IdP:** Google/Microsoft/Okta rejeitam redirect que nao
  seja `localhost` registrado → nesse caso NAO usar preview; usar tunel
  (§3) ou registrar a URL de preview no IdP.
- **Service worker/PWA:** a preview instala o dela — app nao registra a
  propria; em dev, desligar SW se o rewrite de portas falhar.
- **Sessao dormindo:** preview adormece com a sessao (~5 min sem
  requests); abrir o link acorda. Preview morre com archive/encerramento.
- **Cookies separados** entre Preview tab e aba propria — relogar pode
  ser necessario; nao e bug.

## 3. Tunel localhost

- Devin: `devin forward <sessao> 3000` ou `devin ssh -L`.
- Local equivalente: `ssh -L`, `netsh portproxy`, ou simplesmente o app
  ja estar em localhost (que e o caso comum — o tunel so existe porque
  a sessao cloud nao e a sua maquina).
- **Tunel nao e link compartilhavel** — so alcanca quem esta na ponta.
  Preview para compartilhar, tunel para `localhost`-only. Sao
  complementares, nao concorrentes.

## 4. Devin Apps vs preview

Preview = WIP de uma sessao. Devin App = ferramenta interna estavel
pos-sessao. Se o entregavel for "dashboard que o time usa toda semana",
nao e preview — e App (ou, localmente, um servico no ecossistema com
systemd/Task Scheduler). Nao deixar WIP de sessao virar "infra" por
inercia.

## 5. Proibicoes

- Nao expor porta de app com dado sensivel em preview compartilhavel
  sem necessidade — preview segue permissao da sessao, nao do conteudo.
- Nao contornar o rewrite de `localhost` com CORS aberto — o preview
  resolve isso de proposito; abrir CORS e ampliar superficie (§3 raiz).
- Nao usar preview como evidencia de teste — ver §0.
