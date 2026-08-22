# Auditoria Oficial e Handoff — Repositório SOTA GOLD

> **Data:** 22 de agosto de 2026
> **Repositório canônico:** `C:\Users\rapha\.gemini\Site`
> **Base integrada:** `master` em `e348023bcf563289a080de050db21e20fcec29a7`
> **Preparação local pendente de publicação:** `chore/submodule-ownership-rationalization` em `7bc3b71b8178a86a6b5989e6fd432ec10e401d17`
> **Classificação:** registro factual, decisão arquitetural e protocolo de continuidade

## 1. Veredito executivo

O ciclo corrigiu vulnerabilidades de fronteira, eliminou dependências de submódulo irrecuperáveis do grafo oficial, preservou o componente compilatório necessário (Eigen) em snapshot auditável e consolidou gates locais de qualidade. A preparação está **aprovada localmente** e protegida por commit; publicação, PR e CI remoto permanecem bloqueados por billing/LFS do GitHub, não por falha de código.

| Dimensão | Situação | Evidência |
|---|---:|---|
| Integridade do projeto principal | preservada | `Site` continua na branch de trabalho, com 10 alterações preexistentes não tocadas |
| Segurança de dependências Node em produção | verde | `npm audit --omit=dev`: 0 vulnerabilidades reportadas no conjunto validado |
| Testes Python focados | verde | 44 testes aprovados no ciclo de correção |
| Gate CWV, A11y, CVE, SRI e higiene | verde | aprovação com 1.924 entradas staged e 0 violações de higiene |
| Clonabilidade do `master` atual | vermelha | sete gitlinks não recuperáveis identificados; correção existe somente no commit local |
| Publicação remota da correção | amarela/bloqueada | push recusado por orçamento LFS excedido, com 9 objetos pendentes |
| CI GitHub Actions | amarela/bloqueada | jobs não iniciam enquanto a conta estiver bloqueada por billing |

## 2. Escopo e método

O escopo foi o repositório `Site`, com foco em segurança, dependências, integrações de navegador/host, qualidade estática e reprodutibilidade Git. O método aplicado foi:

1. medir e confirmar consumidores reais antes de modificar;
2. separar worktrees de experimentação da árvore de trabalho do usuário;
3. testar a cadeia de clone/submódulo a partir das revisões efetivamente fixadas;
4. manter hooks ativos — nenhuma validação foi contornada com `--no-verify`;
5. distinguir defeito de código, limitação de infraestrutura e débito histórico;
6. registrar erros de análise ou de procedimento quando a medição contradisse a hipótese inicial.

## 3. Marcos concluídos

### 3.1 Segurança e higiene do repositório

- chave privada historicamente exposta foi removida do histórico publicável; uma clonagem normal não encontra mais a chave nas referências publicadas;
- a configuração de LFS foi restaurada de modo preciso: executáveis e modelos binários são roteados; extensões textuais e artefatos já rastreados como blob não são forçados artificialmente para LFS;
- a fase de higiene do gate bloqueia caminhos de perfis, caches e ferramentas, blobs acima de 5 MB fora de LFS, binários sem roteamento e scripts PowerShell incompatíveis com o interpretador que executa o hook;
- adaptações de Markdown e URLs no frontend passaram por política explícita de segurança;
- segredos não são aceitos por chat, commit ou URL remota; o Git Credential Manager é a via local aprovada.

### 3.2 Qualidade de código e fronteiras de execução

- correções de diagnóstico em frontend, testes Python e políticas de lint foram auditadas sem introdução de Mypy;
- o projeto passou a evitar instalação automática de dependências por PoCs e runners;
- o fluxo de validação mantém PowerShell 5.1 como fonte de verdade para scripts acionados pelo hook;
- o roteamento local de modelos foi tratado como configuração com consumidor real, não como catálogo inerte;
- configurações de editor, extensões e arquivos de host foram separadas do conteúdo versionado do produto.

### 3.3 Consolidação do baseline integrado

A PR #22 foi mesclada por rebase em `master`, gerando `e348023b`. O conteúdo mesclado foi previamente validado localmente, porém o GitHub Actions não executou os jobs: a própria plataforma registrou bloqueio da conta por billing antes do início das etapas. Isso não deve ser classificado como regressão de Python, TypeScript, Next ou segurança.

## 4. Auditoria de clonabilidade e submódulos

### 4.1 Achado crítico

O `master` contém gitlinks que apontam para commits que os upstreams não disponibilizam mais. A inicialização recursiva falhou primeiro em `skills/gemini-cli-jules`; a investigação de todas as referências identificou seis skills opcionais inacessíveis e o Eigen inacessível como submódulo.

| Grupo | Estado do gitlink | Decisão |
|---|---|---|
| `skills/Stitch` | alcançável | manter como pin externo |
| `skills/exa-mcp-server` | alcançável | manter como pin externo |
| seis skills opcionais | commits não recuperáveis | retirar do superprojeto; cópias locais não são apagadas |
| `core/vendor/eigen` | commit upstream não recuperável, mas dependência viva | vendorizar snapshot exato |

### 4.2 Eigen: decisão e prova de integridade

`core/tensor_engine` inclui `<Eigen/Dense>` e referencia `core/vendor/eigen`; removê-lo quebraria o motor tensorial. O snapshot local limpo no commit upstream `0430489b826d88f7d3879232fe13468e16ced465` foi incorporado como fonte versionada, com licenças preservadas.

| Propriedade | Resultado |
|---|---:|
| Arquivos na origem local limpa | 1.933 |
| Arquivos no snapshot versionado | 1.933 |
| Ausentes / extras / divergentes por SHA-256 | 0 / 0 / 0 |
| Alteração de conteúdo para adequação de estilo | nenhuma |

O `.gitattributes` declara exclusivamente `core/vendor/eigen/**` como exceção de whitespace para preservar o upstream byte a byte. A exceção não alcança código próprio.

### 4.3 Commit de racionalização

O commit local `7bc3b71b` implementa a decisão em [SUBMODULE_OWNERSHIP_PLAN.md](../architecture/SUBMODULE_OWNERSHIP_PLAN.md):

- remove os seis gitlinks opcionais inválidos e os workspaces npm correspondentes;
- remove o gitlink do Eigen e adiciona seu snapshot integral;
- mantém apenas os dois submódulos recuperáveis;
- atualiza `.gitmodules`, workflow, Vitest, lockfile e índice de fronteiras;
- documenta que `gemini-cli-security` só pode voltar mediante fork acessível, com mantenedor e política de atualização explícitos.

## 5. Evolução do quality gate

### 5.1 Erro identificado e corrigido

Ao validar o vendor, o gate de higiene não concluía de maneira operacional porque abria processos Git por arquivo staged. Com 1.924 itens, essa implementação era proporcionalmente inadequada. A correção lê o índice uma vez e consulta tamanhos de blobs em lote; não removeu qualquer regra de segurança.

| Indicador | Antes | Depois |
|---|---:|---:|
| Estratégia de consulta ao índice | processo por arquivo | índice único + `cat-file --batch-check` |
| Gate com 1.924 itens | não concluía de forma confiável | aprovado em 15,8 s |
| Limite para blobs sem LFS | 5 MB | 5 MB, inalterado |
| Checagem PowerShell 5.1 | ativa | ativa para todo script do projeto |
| Exceção | inexistente | somente scripts internos do snapshot Eigen, não executados pelo produto |

Também foi corrigido o destino padrão dos relatórios do gate: um worktree agora grava em seu próprio `reports/cwv`, sem contaminar o checkout principal.

### 5.2 Resultado final do gate no commit

```text
StagedFiles                1924
PowerShell51               0 falhas
ForbiddenPaths             0
OversizedBlobs             0
UnroutedBinaries           0
Core Web Vitals            aprovado
Acessibilidade             aprovado
CVE                        0 crítico / 0 alto / 0 total
SRI/SHA-512                verificado
```

## 6. O que aprendemos

| Aprendizado | Implicação operacional permanente |
|---|---|
| Gitlink não é dependência válida sem commit recuperável | validar commit e origem, não somente URL declarada |
| Submódulo de infraestrutura central e upstream sem retenção requer posse explícita | vendor snapshot ou fork próprio; nunca pin morto |
| Projeto grande testa o próprio gate | hooks devem ser lineares ou em lote, não um processo por arquivo |
| Snapshot third-party não deve ser reformatado para agradar linters | preservar hash/licenças e limitar exceções por caminho |
| `npm ci --ignore-scripts` não representa o ambiente real quando Prisma depende de geração | usar o procedimento que o CI realmente usa em validação reprodutível |
| Falha de job antes de etapas não é falha de código | conferir anotação do job e billing antes de alterar fonte |
| Falha de push LFS é uma restrição de plataforma | não tentar force push, nem criar caminhos paralelos com artefatos fora de controle |
| Worktree isolado reduz risco, mas processos interrompidos podem deixá-lo parcial | confirmar HEAD/commit, preservar a branch e limpar somente com alvo validado |

## 7. Bloqueios externos e pendências reais

### Bloqueios externos

1. **GitHub Actions:** a conta está bloqueada por billing; jobs não iniciam.
2. **Git LFS:** o push de `chore/submodule-ownership-rationalization` foi recusado porque o orçamento LFS foi excedido ao transferir 9 objetos.

### Pendências técnicas, sem risco ativo conhecido

| Pendência | Estado | Tratamento correto |
|---|---|---|
| `chromadb 1.5.9` | sem correção upstream conhecida | não exposto: uso embarcado, sem servidor escutando; reavaliar quando houver patch |
| cache Git LFS local | alto volume, baixo ganho | dry-run projeta apenas ~274 MB de poda; não executar limpeza destrutiva sem benefício material |
| nove branches locais antigas | nunca publicadas | não são risco remoto; revisar separadamente antes de apagar |
| contador Dependabot | histórico/agregado | reprocessar e triar por componente, versão, alcance e explorabilidade |
| driver Intel UHD 630 | antigo | manter: fornece Quick Sync; não desabilitar por “otimização” |

## 8. Protocolo de handoff e retomada

### Pré-condições invioláveis

- trabalhar no diretório canônico `C:\Users\rapha\.gemini\Site`, sem assumir `Site.code-workspace`;
- preservar as alterações não commitadas e os worktrees existentes;
- não usar `reset --hard`, `checkout --`, `clean`, force push ou bypass de hook;
- não aceitar, registrar ou colar credenciais em comandos, relatórios ou URLs;
- não introduzir Mypy;
- validar PowerShell com `powershell.exe` 5.1 quando o artefato for executado pelo hook;
- não tratar erro de billing/LFS como justificativa para alterar código.

### Sequência após a regularização de billing/LFS

1. Confirmar que Actions e LFS foram desbloqueados no GitHub.
2. Publicar a referência local, sem rebasing desnecessário:

   ```powershell
   git -C C:\Users\rapha\.gemini\Site push --set-upstream origin chore/submodule-ownership-rationalization
   ```

3. Fazer clone limpo com submódulos recursivos e validar os dois pins restantes.
4. Executar `npm ci` normal, typecheck, lint, testes e o gate de qualidade no clone novo.
5. Abrir PR para `master`; não fazer merge antes de CI remoto efetivamente iniciado e verde.
6. Depois do merge, confirmar clone recursivo do `master` e só então remover worktrees e clones temporários, mediante alvo resolvido e confirmação de que não contêm recuperação do usuário.

### Prompt de continuidade

```text
Retome C:\Users\rapha\.gemini\Site.

Fato central: master e348023b contém a baseline mesclada, mas ainda possui
gitlinks irrecuperáveis. A correção está pronta localmente em
chore/submodule-ownership-rationalization / 7bc3b71b e não foi publicada
porque GitHub LFS recusou o push por orçamento excedido. Actions também não
inicia enquanto billing estiver bloqueado.

Não alterar a árvore principal nem os 10 deltas preexistentes. Após o billing:
1) push da branch; 2) clone limpo --recurse-submodules; 3) npm ci normal;
4) typecheck/lint/testes/gate; 5) PR; 6) CI verde; 7) merge. Não usar bypass,
force push, reset destrutivo, Mypy ou credenciais em texto.

O Eigen é vendor intencional, com 1.933 hashes idênticos ao snapshot
0430489b; Stitch e Exa permanecem gitlinks. Os seis outros skills saíram
do grafo oficial, mas suas cópias locais não foram apagadas.
```

## 9. Critério de encerramento

Esta etapa está encerrada quando a branch local estiver preservada e o handoff permitir retomada sem redescoberta. A etapa de publicação só poderá ser encerrada depois que billing/LFS permitir push, a CI tiver executado e a PR tiver sido revisada e mesclada de forma explícita.
