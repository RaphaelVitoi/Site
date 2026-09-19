---
id: auditoria-2026-09-17-frontend-padrao-ouro
tipo: auditoria
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-17T03:10:00-03:00'
atualizado_em: '2026-09-17T03:10:00-03:00'
classes: [interno, medido, seguranca, frontend]
caminhos:
  - reports/AUDITORIA-2026-09-17-frontend-padrao-ouro.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  diretorio_de_trabalho: frontend
  branch: master
  commit_base: 3ee43c77
  host: Windows 11 Pro 10.0.26200, dev server Next 16.3.5 em :3000, Chrome via DevTools em contexto isolado
  observacao: tamanhos de script medidos no dev server, sem minificacao; producao nao medida
  data_das_medicoes: 2026-09-17
verificado:
  - GET /dashboard sem sessao devolve 307 para /login; nenhum signIn, next-auth/react signIn nem link para /api/auth/signin em src fora de testes
  - ambiente sem AUTH_GOOGLE_ID nem AUTH_DISCORD_ID; /api/auth/providers lista discord e google
  - SotaGlobalSyncProvider -- teste Jest com heroStack 77 salvo termina com physics 40 e localStorage 40; reproduzido no Chrome real com reload em /simulador
  - DashboardSOTA exibe perfil fixo como Diagnostico dos 6 Vetores e 3 eventos de telemetria sinteticos quando nao ha dados; /templo/analytics consulta userId anonymous, que nenhuma escrita produz
  - /dashboard exibe Agentes Vivos 15 fixo contra 19 no data/agents_manifest.json, evLoss 12 fixo e rotula chamadas como Custo Diario em Tokens
  - GET /api/proxy?url=/api/files/list devolve 404; a pagina /dashboard/files depende inteiramente dessa rota
  - SniperAdvisor compara com Risk Premium, Bolha e Pos-Flop; o perfil so produz as 6 chaves do radar
  - artigo /biblioteca/geometria-do-risco sem bloco mermaid carrega 1144 KB do core do mermaid e 800 KB do KaTeX no dev
  - eslint . sobre 348 arquivos -- 0 erros, 0 avisos; npm audit -- 0 vulnerabilidades
  - home e /simulador sem erro nem aviso de console; crossOriginIsolated true; nenhum recurso externo carregado na home
nao_verificado:
  - bundle de producao; next build sobrescreveria o .next do dev server em uso
  - microfone real no reconhecimento de fala (FE-08 e inferido do codigo)
  - fluxo autenticado de ponta a ponta; nao ha login possivel neste ambiente
  - acessibilidade alem do que a fase 2 do cwv_gate ja mede
  - motores matematicos, workers e WASM alem dos caminhos de estado citados; ja tem suite propria
  - responsividade visual e regressao de layout
pendencias:
  - id: pend-2026-09-17-login-inexistente
    o_que: Decidir o fluxo de entrada -- provedor OAuth real, convidado com sessao de verdade, ou retirar o gate de sessao das rotas de produto (FE-01)
    dono: Tier 0
    prazo: 2026-09-24
  - id: pend-2026-09-17-operador-sem-allowlist
    o_que: Restringir /dashboard a identidade de operador em vez de qualquer conta OAuth (FE-04)
    dono: Tier 0
    prazo: 2026-09-24
  - id: pend-2026-09-17-hidratacao-apaga-estado
    o_que: Corrigir SotaGlobalSyncProvider para restaurar e nao sobrescrever o estado salvo (FE-02)
    dono: Tier 0
    prazo: 2026-09-24
  - id: pend-2026-09-17-diagnostico-fabricado
    o_que: Retirar ou rotular como exemplo o perfil e a telemetria sinteticos exibidos como dado do usuario (FE-03, FE-05)
    dono: Tier 0
    prazo: 2026-09-24
---

# Auditoria do frontend — 2026-09-17

**Escopo:** `frontend/src`, cerca de 46 mil linhas: rotas do App Router,
middleware (`proxy.ts`), autenticação, `next.config.js`, componentes de
simulador e laboratório, hooks de estado, clientes de telemetria e o renderizador
de markdown. As rotas de API já foram cobertas pela auditoria de backend de
2026-09-16 e só reaparecem aqui pelo lado do cliente.

**Método:** leitura dirigida pelos pontos onde um defeito vira falha de
segurança, de integridade ou de dado. Cada achado P1 e P2 foi provado por
execução: `curl` e Chrome real no dev server, ou teste Jest contra o código
atual. O que é inferência está marcado.

**Auditoria anterior:** `AUDITORIA-SOTA-FRONTEND-ENTROPIA-2026-09-15` cobriu só
código morto (knip). Nenhum achado abaixo se sobrepõe a ela.

**Numeração:** `FE-nn`.

---

## Resumo

| # | Sev. | Achado | Prova |
| :-- | :-- | :--- | :--- |
| FE-01 | **P1** | Não existe login: o botão "Convidado" não autentica, e toda rota com sessão fica inalcançável | curl + busca |
| FE-02 | **P1** | O provider global apaga o estado salvo do simulador a cada carregamento | Jest + Chrome |
| FE-03 | **P1** | Diagnóstico e histórico do usuário exibidos a partir de dados fixos e sintéticos | leitura |
| FE-04 | P1 | `/dashboard` do operador aberto a qualquer conta OAuth | leitura |
| FE-05 | P2 | Dashboard mostra valores fixos como telemetria | leitura + contagem |
| FE-06 | P2 | Página de arquivos depende de `/api/proxy`, que não existe | curl |
| FE-07 | P2 | `SniperAdvisor` nunca casa um caso; a recomendação é sempre genérica | leitura |
| FE-08 | P2 | Reconhecimento de fala sem cleanup reinicia o microfone | inferido |
| FE-09 | P2 | mermaid e KaTeX carregados em toda página com markdown | dev server |
| FE-10 | P2 | Cliente de telemetria perde lotes grandes e o fim da sessão | leitura |
| FE-11 | P3 | `biblioteca/[slug]` sem encode do slug e sem SSR | leitura |
| FE-12 | P3 | CSP com `script-src 'unsafe-inline'` e `connect-src` amplo | leitura |
| FE-13 | P3 | `next/image` com avatar externo sem `remotePatterns` | inferido |
| FE-14 | P3 | `useDebouncedLocalStorage` sem tratamento de quota e sem flush | leitura |
| FE-15 | P3 | Login com fallback morto e alegação "Encryption Active" | leitura |
| FE-16 | P3 | Pilha Supabase ligada ao middleware sem uso de sessão | leitura |

---

## P1

### FE-01 — Não existe login

`src/app/(auth)/login/page.tsx`: "Entrar como Convidado SOTA" só faz
`router.push(callbackUrl)`. O botão do Google está `disabled`. Não há `signIn`
em nenhum arquivo de `src` fora de testes, e o `Header` não tem link de entrada.

**Prova:**

```
GET /dashboard                         -> 307 /login?callbackUrl=%2Fdashboard
GET /login?callbackUrl=/dashboard      -> 200
busca por signIn( | /api/auth/signin   -> nenhuma ocorrência
```

O convidado volta ao `/dashboard`, o `proxy.ts` não acha token e devolve a
`/login`: um ciclo sem saída. As rotas que exigem sessão ficam inalcançáveis pela
interface, e a telemetria delas recebe 401: `/api/v1/gemma`, `rag`, `search`,
`telemetry`, `logs/frontend`, `sota/pmev-heatmap` e `sota/timesfm-forecast`.
Neste ambiente nem o fluxo manual por `/api/auth/signin` funciona: não há
`AUTH_GOOGLE_ID` nem `AUTH_DISCORD_ID`.

**Decisão do Tier 0:** provedor OAuth real, convidado com sessão de verdade, ou
tirar o gate de sessão das rotas de produto.

### FE-02 — O provider global apaga o estado salvo

`SotaGlobalSyncProvider` (`frontend/src/components/simulator/hooks/useSotaSync.tsx`, montado em `frontend/src/app/layout.tsx`)
combina dois efeitos no mesmo commit:

1. o de `useDebouncedLocalStorage` lê o salvo e **agenda** `setValue`;
2. o de hidratação do provider roda **na mesma passada**, com `storedPhysics`
   ainda no padrão, copia o padrão para `physics` e marca `isHydrated = true`.

Na renderização seguinte, com o valor salvo enfim disponível, `isHydrated` já é
`true`, e a hidratação não reexecuta. O efeito de persistência grava então o
padrão por cima do localStorage.

**Prova (Jest, código atual):** `heroStack` salvo 77, provider montado, timers
avançados. Resultado: `physics.heroStack = 40` e localStorage com
`heroStack = 40`.

**Prova (Chrome real):** em `/simulador`, localStorage com `heroStack = 77`.
Após reload, o valor é 40.

A persistência da "física da mesa" entre simuladores nunca funcionou: o recurso
existe só para apagar o que salva. O teste de prova está guardado fora do
repositório, pronto para virar regressão.

### FE-03 — Diagnóstico e histórico fabricados

`frontend/src/components/simulator/DashboardSOTA.tsx`, usado em `/simulador` e em
`/templo/analytics`:

- **Perfil fixo:** sem perfil vindo do contexto, o radar "Diagnóstico dos 6
  Vetores de Ameaça" e os "top leaks" usam um perfil **fixo**
  (`'Aversão ao Risco': 0.85`, …), sem rótulo que o distinga de medição.
- **Telemetria sintética:** sem telemetria, o componente inventa 3 eventos
  datados de "agora" (`evLoss 1.2 / 0.3 / 0`).
- **Consulta sem dados possíveis:** `/templo/analytics` busca
  `telemetryEvent` com `userId: 'anonymous'`. A escrita exige sessão e grava o id
  da sessão (`resolveTelemetryIdentity`), então essa consulta nunca devolve nada
  e o componente cai sempre nos dados sintéticos.
- **Origem descartada:** `/api/v1/predictive` devolve `source: 'baseline'`, mas a
  interface ignora o campo.

É a mesma classe do BK-09 do backend: número sem medição apresentado como
medição, aqui em forma de diagnóstico pessoal. O `icmQuizGenerator` também usa
esse perfil para enviesar as perguntas.

### FE-04 — Dashboard do operador aberto a qualquer conta OAuth

`frontend/src/auth.ts` configura Discord e Google sem callback `signIn` nem allowlist, e
`proxy.ts` protege `/dashboard` só pela existência de token. Quando os provedores
forem configurados, **qualquer** conta Google ou Discord verá a telemetria da
fila e do orçamento do operador. **Inferido do código:** não há login para
testar.

---

## P2

### FE-05 — Dashboard com valores fixos

`app/(user)/dashboard/page.tsx`:

- **"Agentes Vivos":** sempre `15`. O `data/agents_manifest.json` tem **19**
  agentes, e nenhum dos dois números mede agente vivo.
- **`evLoss`:** sempre `12`.
- **"Custo Diário (Tokens)":** mostra `daily_usage.call_count`, que conta
  chamadas, não tokens.
- **`dailyBudget: 5000`:** coincide hoje com `llm/budget.py`, mas é cópia do
  valor, não leitura, e diverge na primeira mudança.

### FE-06 — `/dashboard/files` depende de rota inexistente

A página faz `fetch('/api/proxy?url=/api/files/list')` e usa o mesmo prefixo para
`view` e `raw`. **Prova:** `GET /api/proxy?url=/api/files/list -> 404`. A página
inteira é morta. A URL montada tem outro defeito: `&raw=true` fica do lado de
`/api/proxy`, não dentro de `url=`.

**Cuidado ao reativar:** um proxy genérico com a credencial de serviço seria
exatamente o `confused deputy` que o BK-19 restringiu.

### FE-07 — `SniperAdvisor` nunca casa

O `switch` compara com `'Risk Premium'`, `'Bolha'` e `'Pós-Flop'`. O perfil só
produz `Aversão ao Risco`, `Pot Entrapment`, `Miopia de Payjump`,
`Excesso de Agressão`, `Passivo Estrutural (RIO)` e `Desvio de Nash`. Todo caso
cai no `default`.

### FE-08 — Microfone reinicia sem controle (inferido)

`frontend/src/app/(lab)/templo/gemma/page.tsx:318-411` (linhas em 3ee43c77): o efeito que cria o `SpeechRecognition` não
devolve cleanup e depende de `dictationMode` e `generateAnalysis`. A cada troca,
uma instância nova é criada e a anterior segue viva. O `onend` de cada uma chama
`rec.start()` enquanto `isListeningRef.current` for `true`, inclusive depois de o
componente desmontar numa navegação SPA. É ponto de privacidade, não só de
recurso. Não houve microfone no navegador automatizado.

### FE-09 — mermaid e KaTeX em toda página com markdown

`SotaMarkdown` importa `mermaid` e `katex.min.css` estaticamente, e é usado por
28 arquivos. **Medido no dev:** `/biblioteca/geometria-do-risco`, sem
nenhum bloco mermaid, carrega 1.144 KB do core do mermaid e 800 KB do KaTeX, de
11.050 KB totais. O tamanho em produção não foi medido. O `MermaidChart` também
não re-renderiza quando `code` muda, porque o mermaid marca o nó como processado.

### FE-10 — Cliente de telemetria perde dados

`frontend/src/lib/telemetry-client.ts`:

- `keepalive: true` com corpo acima de 64 KiB faz o `fetch` rejeitar, e o
  `.catch(() => {})` descarta o lote. O lote não tem teto.
- O envio só acontece pelo timer de 2 s, sem flush em `pagehide`. O comentário
  diz o contrário ("assegura o envio mesmo na morte da aba").

---

## P3

- **FE-11:** `biblioteca/[slug]` interpola o slug em `/api/v1/content/${slug}` sem
  `encodeURIComponent`. Um `%2F` decodificado vira caminho em outra rota de mesma
  origem. A página também é só client-side, sem SSR nem `metadata`.
- **FE-12:** a CSP tem `script-src 'unsafe-inline'`, o que anula a proteção dela
  contra XSS, e `connect-src https: ws: wss: http://127.0.0.1:*`. Hardening: Next
  suporta nonce.
- **FE-13:** `DashboardSOTA` passa `session.user.image` (avatar do provedor) a
  `next/image`, e `next.config.js` não tem `images.remotePatterns`. Com sessão
  real, o render quebra. Inferido.
- **FE-14:** `useDebouncedLocalStorage` chama `setItem` dentro de `setTimeout`
  sem `try/catch` (quota excedida, modo privado), faz `JSON.parse` sem validar a
  forma, e o unmount cancela a última gravação pendente em vez de gravá-la.
- **FE-15:** no login, `safeRedirectPath(...) || '/dashboard'` nunca usa o
  fallback, porque a função devolve `'/'`, nunca vazio. O rodapé afirma
  "State-of-the-Art Encryption Active" numa página que não autentica.
- **FE-16:** `proxy.ts` chama `updateSession` do Supabase, que faz `getUser()`
  de rede, em toda requisição protegida quando as variáveis existem, e o callback
  troca código por sessão Supabase. Nenhuma parte do app usa sessão Supabase: a
  autenticação é NextAuth. Hoje é inerte, porque o Supabase não está configurado.

---

## O que foi verificado e está correto

- **Markdown:** `react-markdown` 9 sanitiza `href` por `urlTransform`; mermaid em
  `securityLevel: 'strict'`; KaTeX sem `trust`; política de mídia só aceita
  `http(s)`, YouTube e `.mp4` em https.
- **Redirect:** `safeRedirectPath` recusa `//`, barra invertida e controles.
- **Busca web:** só devolve links `http(s)`.
- **Workers ICM:** respostas conferidas por id de job, sem resultado atrasado
  sobrescrevendo o atual.
- **Estático:** eslint 0 erros e 0 avisos em 348 arquivos; `tsc` limpo;
  `npm audit` 0.
- **Runtime:** home e simulador sem erro de console; isolamento de origem ativo;
  nenhum recurso externo na home. O conflito possível entre `COEP: require-corp`
  e imagem ou vídeo externo em markdown é latente, não observado.

## Ordem sugerida

Impacto dividido pelo raio de alteração:

1. **FE-02:** um efeito, com o teste de prova já pronto.
2. **FE-03 e FE-05:** remover ou rotular dados fixos.
3. **FE-07:** chaves do `switch`.
4. **FE-08:** cleanup do reconhecimento de fala.
5. **FE-10:** teto de lote e flush em `pagehide`.
6. **FE-01 e FE-04:** decisão de produto do Tier 0.
7. **FE-06:** remover a página ou desenhar uma rota restrita.
8. **FE-09:** carregar mermaid e KaTeX sob demanda.
9. P3.
