---
id: validacao-2026-09-16-correcao-dos-achados-do-backend
tipo: validacao
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-17T01:30:00-03:00'
atualizado_em: '2026-09-17T01:30:00-03:00'
classes: [interno, medido, seguranca, backend]
caminhos:
  - reports/VALIDACAO-2026-09-16-correcao-dos-achados-do-backend.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  commit_base: 9c3c405a
  host: Windows 11 Pro 10.0.26200, Python do .venv do projeto, Node do frontend
  bench_sqlite: arquivo WAL em temp/, 300 tarefas x 3 escritas, 3 rodadas por modo
  data_das_medicoes: 2026-09-16 e 2026-09-17
verificado:
  - 81 testes novos em tests/test_auditoria_backend_2026_09_16.py; 71 deles reprovam contra HEAD 9c3c405a numa worktree separada, os 10 restantes sao controles positivos
  - suite Python integral por scripts/ops/suite_verde.py -- verde, 0 erros, 0 warnings, 1 pulado (test_ingestao_superseded, sem arvore superada a excluir)
  - suite frontend integral -- 67 suites, 477 testes aprovados, incluindo o gateway de logs e o PDF sem numeros fixos
  - tsc -p tsconfig.audit.json sem erro; eslint sem erro nos arquivos tocados; ruff check e ruff format limpos nos arquivos Python tocados
  - security-review sobre o diff -- nenhuma vulnerabilidade com confianca maior ou igual a 8; o desvio de ponto final no Windows (confianca 6) foi corrigido e ganhou guard
  - BK-10 medido -- synchronous FULL 8,40 ms por escrita contra NORMAL 8,26 ms; conexao nova 6,8 ms contra persistente 1,4 ms; conexao ancora nao reduziu o custo
nao_verificado:
  - worker real e chamadas a LLM nao executados; as chaves estao revogadas
  - nenhum teste de carga para BK-06
  - portao cwv_gate roda no commit; seu veredito e declarado na mensagem de commit, nao aqui
  - migracao ALTER TABLE exercitada so em banco em memoria e temporario, nao contra queue/tasks.db real
  - causa dos cerca de 5 ms extras por conexao nova no SQLite nao isolada
pendencias_resolvidas:
  - pend-2026-09-16-god-mode-identidade
  - pend-2026-09-16-god-mode-superficie-de-escrita
  - pend-2026-09-16-jwt-anon-key
  - pend-2026-09-16-arbitrador-dependencias
---

# Correção dos achados da auditoria de backend — 2026-09-16

Resolve os 21 achados de `reports/AUDITORIA-2026-09-16-backend-padrao-ouro.md`,
por delegação do Tier 0 com autonomia total (§3.1 da raiz).

## Decisões tomadas por delegação

| Achado | Alternativa escolhida | Motivo |
| :--- | :--- | :--- |
| BK-02 | **Aditiva**: lista protegida ampliada, comparada por componente de caminho | Preserva a capacidade de escrita do agente; allowlist e modo patch seriam reduções materiais |
| BK-04 | Dependente de tarefa `failed` passa a `failed` com `workflow_status: upstream_failed` | Esperar para sempre seria silencioso; dependência ausente segue como espera, porque o dispatcher insere as subtarefas em paralelo |
| BK-10 | Remover os PRAGMAs inertes **sem** ligar `synchronous=NORMAL` | Medido: 1,7% de ganho não paga a perda de durabilidade |
| CLI `ingest` | Identidade explícita `@dispatcher` | Era o valor que a dedução produzia com a fila parada; não herda privilégio de tarefa alheia |

## O que mudou, por achado

- **BK-01:** `apply_god_mode` exige `agent_name`; os três chamadores passam o autor.
- **BK-02:** `is_protected_kernel_path` compara por componente, sem distinguir
  maiúsculas e minúsculas, e normaliza ponto ou espaço final (achado da
  security-review). Cobre `autonomy.json`, `.husky`, `.claude`, `.vscode`,
  `.github`, `conftest.py`, manifestos e `.env*`. O caminho relativo passa a
  resolver na raiz, não no diretório de trabalho.
- **BK-03:** a identidade de produto exige `sub` e `role == "authenticated"`.
- **BK-04:** o arbitrador recebe o status das dependências externas e falha
  fechado. O alerta de deadlock só dispara com ciclo real, detectado pelo
  algoritmo de Kahn.
- **BK-05:** no máximo 100 eventos por requisição, cada um validado e truncado.
  O `AuditEngine` troca o buffer antes de gravar. O logger do frontend envia em
  fatias de 100.
- **BK-06:** o rate limit conta por visitante quando o gateway se identifica com a
  credencial de serviço (hash do id via `X-Nexus-Client-Id`), e usa o último salto
  do `X-Forwarded-For`.
- **BK-07:** novas colunas `claimed_by` e `claimed_at`. A recuperação devolve à
  fila só as tarefas sem dono ou com dono morto neste host; o encerramento, só as
  do próprio worker.
- **BK-08:** a view compara com `strftime` no formato ISO e é recriada com `DROP`.
- **BK-09:** série sem medição é omitida.
- **BK-11:** a reserva não sobrescreve mais `timestamp`. O `POST /add` normaliza
  para ISO em UTC. Status inválido é recusado antes do banco. O insert do arquivo
  usa colunas explícitas.
- **BK-12:** quebra de linha e parênteses bloqueados no modo `partial`; a
  denylist normaliza espaços.
- **BK-13:** a rota predictive envia a credencial de serviço.
- **BK-14:** sem chave, a chamada ao Gemini levanta erro em vez de usar
  `API_SECRET_TOKEN`.
- **BK-15:** erro interno fica no log e o cliente recebe mensagem genérica;
  validação de domínio continua visível, distinguida pela classe exata do erro.
- **BK-16:** corpo lido com teto de bytes real, não o `Content-Length` declarado.
- **BK-17:** entrada do PDF validada por tipo e faixa, com escape completo.
- **BK-18:** limites em `RAGQuery` e `n_results`; o cache de consulta fica só em
  memória.
- **BK-19:** arquivos sensíveis negados na leitura e omitidos da listagem;
  resposta crua com `CSP: sandbox`.
- **BK-20:** o middleware de headers de segurança passa a ser o mais externo.
- **BK-21:** a chave Gemini sai da URL para o header `x-goog-api-key` em
  `llm/gemini.py`, `engine/llm_api.py`, `cli/commands.py`,
  `scripts/utils/network_diagnostic.py` e na rota RAG do Next.

## Record-Id SQL-PLACEHOLDERS-2026-09-16

Três `noqa: S608` em `database/queue_manager.py` — `get_task_statuses`,
`release_running_tasks` e o insert de `_archive_and_tasks`. O f-string interpola
**só** uma sequência de `?` gerada por contagem, e colunas literais do código;
todo valor vem de parâmetro ligado. O supressor existe porque o ruff não
distingue placeholder gerado de valor interpolado. Blocos de até 500 ids ficam
abaixo do limite de variáveis do SQLite.

## Dois achados novos, resolvidos na mesma sessão

Encontrados durante a correção. O Tier 0 delegou a decisão ("decida pela melhor
resolução"). Como nunca foram publicados como pendência, entram aqui como
resolvidos, sem abrir e fechar o mesmo id.

1. **O logger do navegador nunca autenticava em `/api/logs/frontend`.** Com token
   configurado, toda a telemetria de UI recebia 401. O navegador não pode portar a
   credencial de serviço, então passa a enviar ao gateway de mesma origem
   `frontend/src/app/api/v1/logs/frontend/route.ts`, que exige sessão e encaminha
   por `encaminharAoNexus`. É o mesmo modelo das rotas SOTA e da telemetria
   autenticada (SEC-008). No servidor, o logger não faz chamada de rede: URL
   relativa não resolve em Node, e o log já vai ao stdout.
   - **Custo aceito:** visitante sem sessão não gera telemetria de UI. Antes ele
     também não gerava, porque recebia 401.

2. **O PDF de `pmev-pdf` afirmava números fixos como se fossem do cenário do
   usuário:** limiar ICM 49,5%, "Delta −6,33%" e "Monte Carlo 100.000 iterações"
   com EV, taxa de sucesso e vantagem por decisão. Uma busca no repositório não
   achou fonte para nenhum deles. A afirmação de blocker ("reduz AA/AK/AQ em 50%")
   contradiz a combinatória: com um Ás na mão, AA cai de 6 para 3 combos, mas AK e
   AQ caem de 16 para 12. As seções 5 a 7 passam a ser derivadas só dos dados
   enviados, por `linhasDoCenario`. O que não foi calculado aparece declarado como
   não calculado. Seções conceituais e fórmulas do autor ficaram intactas: são
   doutrina, não afirmação empírica.
