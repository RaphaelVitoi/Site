---
id: validacao-2026-09-17-producao-oauth-microfone-e-fontawesome
tipo: validacao
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-17T10:30:00-03:00'
atualizado_em: '2026-09-17T10:30:00-03:00'
classes: [interno, medido, seguranca, frontend]
caminhos:
  - reports/VALIDACAO-2026-09-17-producao-oauth-microfone-e-fontawesome.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  commit_base: e2a8cf17
  host: Windows 11 Pro 10.0.26200, Next 16.3.5 dev em :3000 e next start de producao em :3100, Chrome via DevTools em contexto isolado, Node 24.16.0
  producao: next build com AUTH_SECRET aleatorio gerado no processo e IDs de provedor ficticios; nenhuma credencial real
  data_das_medicoes: 2026-09-17
verificado:
  - next build de producao -- 64 paginas, TypeScript limpo, sem warning; o dev server grava em .next/dev e a limpeza do build preserva dev, cache, lock e trace, entao os dois rodam juntos
  - producao -- /dashboard sem sessao 307 para /login; /api/vitoi/files/list sem sessao 401; CSP sem unsafe-eval; COOP e COEP presentes
  - OAuth no navegador de producao -- botao Google chama /api/auth/signin/google e recebe a URL de autorizacao do Google com PKCE S256 e o client_id configurado; interceptado antes de sair para o Google
  - OAuth completo do csrf a sessao com @auth/core real e Discord simulado por customFetch -- e-mail nao verificado termina em AccessDenied sem cookie de sessao; verificado cria sessao e volta ao callbackUrl
  - contraprova do OAuth -- sem o callback signIn, o e-mail nao verificado cria sessao e o script sai com codigo 1
  - microfone no Chrome real com a API webkitSpeechRecognition instrumentada -- codigo atual para a instancia do remount do StrictMode e chama stop ao sair da pagina, sem start depois do evento end
  - contraprova do microfone com a pagina de 3ee43c77 -- nenhuma chamada a stop, nem no remount nem ao sair; a instancia segue viva apos a desmontagem
  - erro Router action dispatched before initialization -- reproduzido com relogio -- mensagem serverComponentChanges do HMR entregue aos 307 ms, erro aos 308 ms, hidratacao aos 516 ms; a mesma mensagem apos a hidratacao nao gera erro
  - edicao real de layout.tsx e de page.tsx com a pagina aberta e ja hidratada -- sem erro
  - Font Awesome em producao -- fontes baixadas por pagina de 230 KB para 15 KB; CSS decodificado do artigo de 431 KB para 372 KB; 22 icones no artigo e 37 em /simulador, nenhum vazio; console limpo
  - todo icone do manifesto tem glifo na fonte recortada, conferido pelo cmap com fontTools
  - gerador deterministico -- duas execucoes seguidas produzem SHA-256 identicos das tres fontes e do manifesto; a primeira versao mudava os binarios a cada execucao pelo carimbo head.modified, corrigido com recalcTimestamp=False
  - guarda do subconjunto -- reprova icone Free citado fora do manifesto (fa-hippo) e icone inexistente no Free (fa-radar)
  - Tailwind -- 262 KB de regras de classe, nenhuma sem ocorrencia literal em src; hipotese de gordura refutada, sem acao
  - jest integral 80 suites e 523 testes; tsc e eslint limpos; record_gate.py em seco aprovado
nao_verificado:
  - captura de audio real -- o navegador automatizado nao concede permissao de microfone; start foi chamado, nenhum evento audiostart ocorreu
  - troca de codigo com Google e Discord reais e o formato real de verified e email_verified devolvido por eles -- exige credenciais de producao, que so o Tier 0 pode pôr no ambiente
  - redirect_uri em producao -- NEXTAUTH_URL no .env aponta para localhost:3000; o deploy precisa do valor do dominio real
  - o erro de router em navegador de terceiros ou com dev server remoto; a reproducao foi local
  - Lighthouse e CWV do build de producao
---

# Produção, OAuth, microfone e erro de router — 2026-09-17

Verifica os quatro itens que `reports/VALIDACAO-2026-09-17-correcao-dos-achados-do-frontend.md` declarou
como não verificados, a pedido do Tier 0 ("Verificar e otimizar").

## O erro de router: causa medida, e não a que eu tinha atribuído

A atribuição anterior era "hot reload em cascata durante stash e pop". Estava incompleta. O mecanismo, lido no
código do Next 16.3.5 e reproduzido com relógio, é outro:

1. `hydrate()` em `next/dist/esm/client/app-index.js` abre o websocket de HMR **antes** de
   `await initialServerResponse` e de criar a fila de ações do router.
2. Uma mensagem `serverComponentChanges` que chega nessa janela chama `publicAppRouterInstance.hmrRefresh()`.
3. `getAppRouterActionQueue()` encontra a fila ainda nula e lança o `E668`.

Uma mensagem entregue aos 307 ms reproduziu o erro aos 308 ms, e a hidratação terminou aos 516 ms. A mesma
mensagem depois da hidratação não produz erro, e edições reais de componente de servidor com a página já
hidratada também não. O stash e pop da contraprova é **um** modo de gerar a mensagem durante um carregamento;
qualquer edição de componente de servidor enquanto uma página recarrega serve.

É condição de corrida **só de desenvolvimento**: produção não abre websocket de HMR. `16.3.5` é a `latest`
estável, e não há correção a aplicar no código do projeto. Se reaparecer, recarregar a página resolve.

Um primeiro controle, com a mensagem atrasada 4 s por um `WebSocket` substituído, também deu erro e foi
**descartado como instrumento inválido**: a substituição por função interferia na página, e a hidratação desta
página em dev pode passar de 4 s. O controle válido guardou o handler nativo e só disparou depois de confirmar a
hidratação.

## Produção

`next build` rodou com o dev server ativo. O motivo que eu dera para não rodar — sobrescrever o `.next` do
dev — não se sustentava: no 16.3.5 o dev grava em `.next/dev`, e a limpeza do build exclui
`^(cache|dev|lock|trace)`.

## OAuth

O login real exige credencial de provedor, e credencial não entra por aqui. O que foi possível provar sem ela:

- **No navegador de produção:** o fluxo do cliente chega à URL de autorização do Google, com PKCE S256.
- **Do csrf à sessão:** `frontend/scripts/verificar-oauth-callback.mjs` roda o `@auth/core` real, com estado, PKCE, cookies, troca de código e o callback `signIn` do projeto. Só o Discord é simulado, pelo `customFetch` que o Auth.js expõe para isso. A guarda `frontend/src/tests/api/oauthCallbackFlow.test.ts` executa o script em processo próprio, porque o Jest do projeto não carrega o `@auth/core` ESM.

A contraprova mostra que o achado de confiança 7 era explorável: sem o callback, o e-mail não verificado
abre sessão.

## Microfone

O navegador automatizado não recebe permissão de microfone, então não houve áudio. O ciclo de vida da API real
foi medido com a classe nativa instrumentada, comparando o código atual com o de `3ee43c77`:

| Momento | Código atual | Código de 3ee43c77 |
| :--- | :--- | :--- |
| remount do StrictMode | `stop()` na instância descartada | nenhuma chamada; instância órfã |
| saída da página | `stop()`, evento `end`, sem novo `start()` | nenhuma chamada; instância viva |

## Otimização: Font Awesome

O layout importava `all.min.css`, com as três webfonts completas, e o Footer, presente em toda página,
usa ícones de marca. Toda página baixava `fa-solid-900.woff2` (117 KB) e `fa-brands-400.woff2` (113 KB)
para cerca de 140 ícones, 6 deles de marca.

`frontend/scripts/fontawesome-subset.py` gera em `frontend/src/styles/fontawesome/` o CSS e as fontes só com
os ícones citados em `src`:

| Fonte | Antes | Depois | Glifos |
| :--- | ---: | ---: | ---: |
| solid | 116 KB | 13 KB | 137 |
| regular | 19 KB | 3 KB | 27 |
| brands | 112 KB | 1,5 KB | 6 |

A guarda `frontend/src/tests/styles/fontawesomeSubset.test.ts` reprova ícone citado fora do manifesto e ícone
inexistente no Free. Ela achou três já em produção: `fa-radar`, `fa-grid-2` e `fa-brain-circuit` são do
Font Awesome **Pro** e renderizavam vazios. Viraram `fa-satellite-dish`, `fa-table-cells-large` e `fa-brain`.

**Contornos que perderam a razão.** `REGISTRO-2026-09-16-blindagem-turbopack-e-calibracao-de-prs` adicionou
`transpilePackages: ['@fortawesome/fontawesome-free']` e copiou as quatro webfonts para `frontend/public/webfonts/`,
porque o Turbopack em dev não resolvia `../webfonts` a partir do CSS em `node_modules`. Com as fontes locais em
`src`, esse caminho relativo deixou de existir. Os dois contornos foram removidos, e o dev server resolveu as fontes
novas: 37 ícones em `/simulador`, nenhum vazio, console limpo. Nenhum código referenciava `/webfonts/`. O registro
de 09-16 continua como está: descreve corretamente o que foi feito naquele dia.

**Tailwind não tinha gordura.** O CSS global de 311 KB tem 262 KB de regras de classe, e nenhuma sem ocorrência
literal em `src`: são 28 KB em brotli de utilitários usados. Nada a cortar.

## Observação sem ação

`npm start` é `next start`, e o Next avisa que isso não é o modo suportado com `output: 'standalone'`, que usa
`node .next/standalone/server.js`. Funcionou nas medições. Nenhum consumidor de `npm start` foi encontrado no
repositório, e mudar o script sem saber como o deploy sobe seria mexer às cegas.
