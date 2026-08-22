# Relatório Qualitativo Integral — Projeto SOTA GOLD

> **Data:** 22 de agosto de 2026
> **Objeto:** `C:\Users\rapha\.gemini\Site`
> **Natureza:** avaliação qualitativa de produto, arquitetura, engenharia, segurança, governança e operação
> **Base de evidência:** fontes canônicas versionadas, inventário Git, consumidores de runtime e gates locais registrados nesta sessão
> **Limite de afirmação:** este relatório não certifica produção nem substitui CI remoto; GitHub Actions e Git LFS estão bloqueados por billing no momento da avaliação.

## 1. Julgamento executivo

O projeto possui um ativo intelectual e técnico incomum: um núcleo de domínio diferenciado para decisão em poker de torneio, expresso por PMev, ICM, simulação, conteúdo didático e instrumentação. A arquitetura tem ambição legítima de plataforma, mas o valor comercial mais próximo não é "um orquestrador de agentes"; é um **produto de decisão e aprendizagem de poker de alta densidade**, com o simulador e a biblioteca como faces mais promissoras.

O estado atual é de **fundação avançada, produto parcialmente convergido e entrega remota bloqueada por infraestrutura de conta**. A prioridade estratégica não é adicionar novas superfícies nem novos agentes: é reduzir a distância entre a tese proprietária, a jornada pública de usuário e a unidade econômica validável.

| Dimensão | Maturidade | Leitura objetiva |
|---|---:|---|
| Tese de domínio e diferenciação | 4,5 / 5 | PMev, ICM, Risk Premium, toy-games e conteúdo formam um núcleo próprio e coerente |
| Arquitetura de software | 4,0 / 5 | fronteiras bem desenhadas entre produto, domínio, plataforma, operação e fornecedores |
| Segurança aplicada | 3,5 / 5 | autenticação, telemetria, LFS e gates endurecidos; ainda há dívida de artefatos de sessão e dependência conhecida em modo embarcado |
| Qualidade de engenharia | 3,5 / 5 | toolchain moderna e gates reais; cobertura mínima baixa e validação remota indisponível |
| Produto e monetização | 2,5 / 5 | UX e conteúdo avançaram; RLS, shadow sessions, pagamento e webhooks permanecem como épico, não como capacidade comprovada |
| Dados, IA e RAG | 3,0 / 5 | arquitetura multi-provedor e memória local existem; governança de custo, disponibilidade e exposição precisa de produto operacional |
| Operação e entrega | 2,0 / 5 | commit e gates locais são fortes; LFS/billing impedem push, PR e CI efetiva |
| Governança e documentação | 3,5 / 5 | hierarquia canônica é boa; há divergência entre documentação promocional e evidência atual |

## 2. O que o projeto é, de fato

O repositório contém três sistemas que se reforçam, mas ainda competem por atenção:

```text
PMev / ICM / motores matemáticos
          │
          ├── Simulador, laboratórios e biblioteca pública ──> produto de decisão e educação
          │
          └── API, RAG, workers e roteamento LLM ────────────> infraestrutura de inteligência
                         │
                         └── governança, agentes e automação ─> sistema operacional interno
```

Essa composição é poderosa quando a infraestrutura serve a experiência de poker; torna-se dispersiva quando cada camada passa a disputar identidade de produto. A tese mais forte não é vender "IA genérica". É transformar uma vantagem metodológica de poker em:

1. diagnóstico de decisão;
2. simulação explicável;
3. aprendizagem progressiva;
4. retenção por memória de estudo e evolução mensurável;
5. monetização contextual após valor percebido.

## 3. Forças estruturais comprovadas

### 3.1 Diferenciação de domínio

- A separação entre `frontend/`, `api/`, `core/`, `engine/`, `math/` e `wasm-equity/` protege o cálculo de domínio contra acoplamento com UI, IDE ou plugins.
- O conteúdo público não é mero marketing: há aulas, biblioteca, laboratórios, simulador, quizzes e conceitos recorrentes de ICM/PMev.
- A arquitetura prevê isolamento entre cálculo canônico, contratos e superfícies de interação. Isto é condição necessária para que um motor de decisão seja auditável e evolua sem reescrita de interface.
- A presença de WASM para a superfície de equidade demonstra atenção correta à fronteira browser/Node e a performance sensível.

**Interpretação:** existe base para um produto especialista com autoridade real, não apenas uma camada visual sobre APIs externas.

### 3.2 Disciplina de engenharia

O projeto dispõe de um conjunto de práticas superior ao de um protótipo comum:

| Capacidade | Evidência |
|---|---|
| Dependências Python | `uv.lock`, constraints explícitas e `pyright` como verificador de tipos |
| Dependências Node | lockfile, `overrides`, `allowScripts` e auditoria de CVEs |
| Qualidade | Ruff, Pylint, Pyright, ESLint, TypeScript, pytest, Jest/Vitest e actionlint |
| Segurança de mudança | hook CWV/A11y/CVE/SRI/higiene, com política de fail-closed para blobs e scripts |
| Reprodutibilidade | vendor de Eigen, pins de fornecedor e plano explícito de propriedade de submódulos |
| Governança | `governance/` separado de hosts e de código de runtime |

O quality gate foi submetido ao seu próprio caso de escala: 1.924 itens staged. Após corrigir a consulta Git para lote, ele aprovou em 15,8 s sem relaxar suas regras. Isso é evidência de engenharia operacional, não apenas de configuração declarativa.

### 3.3 Segurança por fronteira

As decisões recentes mostram boa direção:

- segredo de autenticação centralizado e com falha fechada fora das exceções controladas;
- identidade de telemetria derivada de sessão autenticada, não de payload livre do cliente;
- URL e Markdown sob política explícita;
- LFS restaurado com regra por tipo e bloqueio de blob fora da política;
- scripts PowerShell validados no PowerShell 5.1, que é o interpretador efetivamente usado pelo hook;
- credenciais excluídas de URLs remotas, relatórios e automações.

## 4. Diagnóstico crítico: onde a excelência ainda não está consolidada

### 4.1 Produto: arquitetura à frente da proposta transacional

O PRD "Fortaleza SOTA" define corretamente a jornada de maior valor: sessão anônima, transição para autenticação, RLS soberano, paywall contextual e webhooks validados. Entretanto, a busca no runtime atual não encontrou integração de provedor de pagamento, checkout ou webhook. Logo:

| Elemento | Estado qualitativo |
|---|---|
| Simulador e conteúdo | superfície presente e utilizável localmente |
| Autenticação | presente em NextAuth/Supabase, com fronteiras endurecidas |
| Shadow session e migração de estado | intenção arquitetural; requer validação específica de implementação |
| RLS como fonte de verdade | princípio correto; evidência de operação end-to-end ainda insuficiente |
| Pagamento, checkout e webhook | não comprovados no runtime atual |

**Consequência estratégica:** a próxima evolução não deve ser mais uma feature autônoma. Deve ser uma vertical slice completa: experimentar uma decisão real, receber explicação, preservar progresso, encontrar um limite de valor e converter com pagamento seguro.

### 4.2 Identidade: o repositório comunica duas promessas

O README apresenta o "Nexus Orchestrator", enquanto a árvore pública concentra material de TrueICM, ICM, PMev e educação de poker. Ambas as dimensões podem coexistir, mas não devem disputar a narrativa principal.

**Decisão recomendada:**

- **produto externo:** TrueICM/PokerRacional, com PMev como proposta central;
- **plataforma interna:** Nexus, invisível para o usuário final salvo quando ampliar explicabilidade, personalização ou velocidade;
- **métrica norte:** qualidade de decisão do jogador, aprendizado e recorrência, não quantidade de agentes, modelos ou diretórios.

### 4.3 Repositório: violação concreta da fronteira de host

Foram identificados **141 artefatos versionados** em `frontend/src/projects/`, totalizando **6.762.316 bytes**:

| Classe | Quantidade | Natureza |
|---|---:|---|
| Memória de sessões | 83 | prompts, imagens e continuidade de agentes |
| Subagentes | 16 | transcrições e registros de execução |
| Feedbacks | 15 | contexto de trabalho histórico |
| Outros documentos de projeto | 27 | planos e registros heterogêneos |

Não há arquivo de runtime no restante de `frontend/src/` que importe essa árvore. Portanto, ela não é parte comprovada do produto. A situação contradiz diretamente a regra versionada segundo a qual memórias de agente, caches e estado de host não são artefatos canônicos.

O scan de padrões de segredo não encontrou chaves privadas, tokens GitHub ou chaves Google/OpenAI nos arquivos rastreados; a única correspondência de padrão `sk-` está em teste de cobertura. Isso reduz a urgência de incidente, mas não elimina a dívida: transcrições podem carregar contexto privado, ruído histórico e custo de revisão.

**Decisão padrão-ouro:** criar uma tarefa de migração com inventário, classificação e revisão de segredo; mover somente conhecimento atemporal e revisado para `docs/` ou `research/`; remover do produto os logs, imagens e transcrições de host. Não apagar em massa antes de uma cópia recuperável e de uma lista de retenção aprovada.

### 4.4 Evidência e documentação: promessas precisam de selo temporal

O README afirma, sem referência temporal de execução atual, "239 testes aprovados", 95% de cobertura para um motor e throughput Spark de 54,7 mil registros/s; também informa 49 rotas, enquanto o inventário atual encontrou 44 arquivos `page.tsx`. Essas afirmações podem ser históricas, mas não devem aparecer como estado presente sem artefato datado e reproduzível.

**Regra recomendada:** todo número de desempenho, cobertura, rotas ou disponibilidade deve carregar `data + comando + commit + ambiente`. Material institucional pode apresentar visão; documentação de engenharia precisa apresentar evidência.

### 4.5 Validação: boa malha local, fechamento remoto indisponível

O projeto possui gates consistentes, mas a sua cadeia de entrega está incompleta enquanto:

- Actions não inicia por bloqueio de billing;
- o push da branch de racionalização é recusado por orçamento LFS excedido;
- `master` ainda conserva gitlinks irrecuperáveis até que `chore/submodule-ownership-rationalization` seja publicado e mesclado.

Isto é risco operacional, não defeito de algoritmo. Porém, para um produto que pretende operar com confiança, disponibilidade de publicação e CI não é detalhe administrativo: é parte do sistema de qualidade.

### 4.6 IA e RAG: arquitetura promissora, governança ainda precisa virar produto

O roteamento multi-provedor, o fallback e a persistência local são capacidades úteis. O `routing_map.json` declara, contudo, que é fallback e que a configuração efetiva vem de `data/system_config.json`; isso é uma decisão boa de precedência. O risco não é haver modelos múltiplos; é não traduzir esta complexidade para política operacional observável:

- orçamento por tarefa e por usuário;
- critérios de escalonamento entre modelo rápido e modelo profundo;
- telemetria de custo, latência, erro e qualidade;
- disponibilidade real de cada modelo configurado;
- política de retenção para dados enviados a provedores.

`chromadb` permanece com advisory sem patch upstream. O uso atual somente por `PersistentClient`, sem servidor em escuta, reduz a superfície e torna a aceitação consciente adequada. A migração para modo HTTP ou serviço exposto deve permanecer bloqueada até correção upstream e revisão de arquitetura.

## 5. Matriz de prioridade

| Prioridade | Decisão | Ganho | Dependência |
|---|---|---|---|
| P0 | regularizar billing e orçamento LFS | restaura push, PR, CI e entrega verificável | ação de conta GitHub |
| P0 | publicar e validar a racionalização de submódulos | torna clone de `master` reprodutível | P0 LFS |
| P1 | higienizar `frontend/src/projects/` com plano de retenção | reduz superfície de privacidade, ruído e custo de revisão | inventário e backup aprovados |
| P1 | atualizar README e números com evidência datada | restabelece confiança documental | medição reproduzível |
| P1 | definir a espinha externa TrueICM/PMev | concentra produto, UX e backlog | decisão de produto |
| P2 | construir vertical slice shadow session → valor → auth → persistência → paywall | transforma tese em unidade econômica validável | P1 de produto; RLS e pagamento |
| P2 | instrumentar custo/latência/qualidade de roteamento LLM | permite economia real e operação responsável | contratos de telemetria |
| P3 | revisar cobertura mínima de 10% | aumenta confiança de regressão nos motores centrais | mapa de criticidade por módulo |

## 6. Arquitetura-alvo recomendada

```text
Visitante
   │
   ▼
Conteúdo / aula / simulador público
   │  decisão explicada + progresso local
   ▼
Shadow session com limites claros
   │  valor percebido e momento de persistência
   ▼
Autenticação + RLS + perfil de estudo
   │
   ▼
PMev / ICM / WASM / serviços Python
   │  explicabilidade, telemetria e custo controlado
   ▼
Assinatura, biblioteca e evolução do jogador
```

Nexus, agentes, RAG e roteamento LLM ficam abaixo dessa cadeia como multiplicadores internos de diagnóstico, curadoria e personalização. Não são a proposta primária para o usuário de poker.

## 7. Critério de excelência para o próximo ciclo

O projeto passa de "fundação avançada" para "produto de excelência operável" quando puder comprovar simultaneamente:

1. clone limpo de `master` com submódulos e dependências reproduzíveis;
2. CI remoto executado e verde em toda PR relevante;
3. uma jornada completa de usuário, do simulador à persistência autenticada, com RLS testado;
4. um caminho de conversão pago com webhook idempotente, assinatura validada e rollback;
5. separação física entre produto, documentação canônica e artefatos de sessão/host;
6. métricas datadas de performance, cobertura, custo e qualidade ligadas ao commit que as gerou;
7. backlog governado pela métrica de valor ao jogador, e não pela expansão indiscriminada do ecossistema técnico.

## 8. Veredito final

O projeto não precisa provar que consegue acumular complexidade; isso já está demonstrado. Precisa agora provar que consegue **converter complexidade em uma experiência de decisão superior, repetível e economicamente coerente**. A melhor estratégia é subtrativa e vertical: estabilizar entrega, eliminar resíduos de host do produto, tornar a narrativa externa unívoca e fechar uma jornada monetizável antes de ampliar a plataforma.
