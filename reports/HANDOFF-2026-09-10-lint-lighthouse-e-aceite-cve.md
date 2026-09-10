---
id: handoff-2026-09-10-lint-lighthouse-e-aceite-cve
tipo: handoff
escopo: Site
ecossistema: nexus-sota
autor: opus-5
criado_em: 2026-09-10T10:30:00-03:00
atualizado_em: 2026-09-10T10:30:00-03:00
classes: [interno, medido, continuidade]
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  origem: origin/master
  so: Windows
  python: '3.14.6'
  suite_python: 1073 passed, 1 skipped
  suite_frontend: 48 suites, 381 tests
  portao_5_fases: SUCESSO (VERDE), 0 erros e 0 warnings
revisoes_de_ancora:
  - registro: auditoria-2026-09-02-integridade-do-projeto-e-piso-de-transformers
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: >
      A alteracao deste commit acrescenta types-defusedxml ao grupo dev,
      seguindo o precedente de types-aiofiles e types-psutil ja declarados ali;
      o lock reflete essa unica adicao. Nenhuma dependencia de runtime muda,
      nenhum piso de versao e alterado, e nenhuma das travas que este registro
      documenta e tocada. Revisado: permanece valido sem alteracao.
  - registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
    caminhos:
      - pyproject.toml
    parecer: >
      A alteracao deste commit acrescenta types-defusedxml ao grupo dev,
      seguindo o precedente de types-aiofiles e types-psutil ja declarados ali;
      o lock reflete essa unica adicao. Nenhuma dependencia de runtime muda,
      nenhum piso de versao e alterado, e nenhuma das travas que este registro
      documenta e tocada. Revisado: permanece valido sem alteracao.
  - registro: handoff-2026-08-30-sanitizacao-linter-e-homeostase-total
    caminhos:
      - pyproject.toml
    parecer: >
      A alteracao deste commit acrescenta types-defusedxml ao grupo dev,
      seguindo o precedente de types-aiofiles e types-psutil ja declarados ali;
      o lock reflete essa unica adicao. Nenhuma dependencia de runtime muda,
      nenhum piso de versao e alterado, e nenhuma das travas que este registro
      documenta e tocada. Revisado: permanece valido sem alteracao.
  - registro: handoff-2026-08-31-saneamento-linters-e-estabilizacao-core-e-api
    caminhos:
      - pyproject.toml
    parecer: >
      A alteracao deste commit acrescenta types-defusedxml ao grupo dev,
      seguindo o precedente de types-aiofiles e types-psutil ja declarados ali;
      o lock reflete essa unica adicao. Nenhuma dependencia de runtime muda,
      nenhum piso de versao e alterado, e nenhuma das travas que este registro
      documenta e tocada. Revisado: permanece valido sem alteracao.
  - registro: handoff-2026-09-08-contraste-fechado-e-o-gatilho-do-lighthouse
    caminhos:
      - reports/cwv/latest_lighthouse_production.json
    parecer: >
      O certificado foi SUBSTITUIDO por um novo, gerado pelo mesmo
      invoke_lighthouse_production_audit.ps1 e vinculado ao fingerprint atual do
      frontend. O que entra no fingerprint nao mudou, o schema e a fonte
      continuam 1.0 e lighthouse, e o TBT medido continua 0 ms. O vencimento
      anterior foi legitimo -- dez arquivos de frontend mudaram. Revisado:
      permanece valido sem alteracao.
  - registro: registro-2026-09-04-lighthouse-certificado-e-o-certificado-que-nao-viajava
    caminhos:
      - reports/cwv/latest_lighthouse_production.json
    parecer: >
      O certificado foi SUBSTITUIDO por um novo, gerado pelo mesmo
      invoke_lighthouse_production_audit.ps1 e vinculado ao fingerprint atual do
      frontend. O que entra no fingerprint nao mudou, o schema e a fonte
      continuam 1.0 e lighthouse, e o TBT medido continua 0 ms. O vencimento
      anterior foi legitimo -- dez arquivos de frontend mudaram. Revisado:
      permanece valido sem alteracao.
  - registro: registro-2026-09-07-certificacao-tbt-e-zero-warnings-cwv
    caminhos:
      - reports/cwv/latest_lighthouse_production.json
    parecer: >
      O certificado foi SUBSTITUIDO por um novo, gerado pelo mesmo
      invoke_lighthouse_production_audit.ps1 e vinculado ao fingerprint atual do
      frontend. O que entra no fingerprint nao mudou, o schema e a fonte
      continuam 1.0 e lighthouse, e o TBT medido continua 0 ms. O vencimento
      anterior foi legitimo -- dez arquivos de frontend mudaram. Revisado:
      permanece valido sem alteracao.
  - registro: registro-2026-09-08-a-fase-3-passa-a-ver-python
    caminhos:
      - data/python_cve_acceptances.json
    parecer: >
      O aceite existente foi ESTENDIDO aos identificadores renumerados
      PYSEC-2026-3813, 3814 e 3815, que o pip-audit declara como aliases de
      CVE-2026-45830, 45833 e 45831 -- as mesmas quatro advisories, mesmo pacote
      e mesma versao 1.5.9. Nenhuma vulnerabilidade nova entrou, nenhum aceite
      foi criado e a autoridade e a data originais foram preservadas. Revisado:
      permanece valido sem alteracao.
  - registro: registro-2026-09-08-auditoria-de-tipagem-e-recorte-do-fingerprint
    caminhos:
      - reports/cwv/latest_lighthouse_production.json
    parecer: >
      O certificado foi SUBSTITUIDO por um novo, gerado pelo mesmo
      invoke_lighthouse_production_audit.ps1 e vinculado ao fingerprint atual do
      frontend. O que entra no fingerprint nao mudou, o schema e a fonte
      continuam 1.0 e lighthouse, e o TBT medido continua 0 ms. O vencimento
      anterior foi legitimo -- dez arquivos de frontend mudaram. Revisado:
      permanece valido sem alteracao.
  - registro: registro-2026-09-08-contraste-icmev-chipev-executado
    caminhos:
      - reports/cwv/latest_lighthouse_production.json
    parecer: >
      O certificado foi SUBSTITUIDO por um novo, gerado pelo mesmo
      invoke_lighthouse_production_audit.ps1 e vinculado ao fingerprint atual do
      frontend. O que entra no fingerprint nao mudou, o schema e a fonte
      continuam 1.0 e lighthouse, e o TBT medido continua 0 ms. O vencimento
      anterior foi legitimo -- dez arquivos de frontend mudaram. Revisado:
      permanece valido sem alteracao.
  - registro: plan-dependency-boundary-reconciliation-2026-09-01
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: >
      A alteracao acrescenta types-defusedxml ao grupo dev -- pacote de stubs, sem
      codigo de runtime -- seguindo o precedente de types-aiofiles e types-psutil
      ja declarados no mesmo grupo. Nenhuma fronteira entre dependencia de runtime
      e de desenvolvimento e movida, que e exatamente o que este plano delimita.
      Revisado: permanece valido sem alteracao.
  - registro: registro-2026-09-09-remediacao-dependabot-httpx2
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: >
      A alteracao deste commit acrescenta types-defusedxml ao grupo dev, seguindo
      o precedente de types-aiofiles e types-psutil ja declarados ali, e o lock
      reflete essa unica adicao. Nenhuma dependencia de runtime muda, e nada toca
      httpx nem a remediacao que aquele registro documenta. Revisado: permanece
      valido sem alteracao.
  - registro: registro-2026-09-09-o-arquivo-gerado-que-expirava-o-certificado
    caminhos:
      - reports/cwv/latest_lighthouse_production.json
    parecer: >
      Aquele registro documenta o certificado sendo invalidado por next-env.d.ts,
      reescrito por next dev apos cada auditoria, e a correcao foi excluir o
      arquivo do fingerprint. Este commit apenas SUBSTITUI o certificado por um
      novo, gerado pelo mesmo orquestrador e vinculado ao fingerprint atual --
      nao altera o que entra no fingerprint nem reabre a causa que aquele
      registro fechou. O vencimento de hoje foi legitimo: dez arquivos de
      frontend mudaram. Revisado: permanece valido sem alteracao.
  - registro: validacao-2026-08-28-arquitetura-de-memoria
    caminhos:
      - scripts/utils/ingest_rag.py
    parecer: >
      A alteracao e de tipagem: metadatas passa a ser anotado com o alias Metadata
      exportado pelo proprio chromadb, porque list e invariante e o parametro do
      upsert pede Mapping. Nenhuma chamada, nenhum caminho de dados e nenhum
      comportamento de ingestao muda -- o cliente continua sendo PersistentClient
      embarcado. Revisado: permanece valido sem alteracao.
caminhos:
  - scripts/utils/gen_ranges.py
  - scripts/utils/ingest_rag.py
  - scripts/ops/Clear-LighthouseOrfaos.ps1
  - scripts/ops/record_anchor_gate.ps1
  - tests/test_credenciais.py
  - data/python_cve_acceptances.json
  - reports/cwv/latest_lighthouse_production.json
  - pyproject.toml
verificado:
  - portao cwv_gate.ps1 aprovado nas 5 fases com zero erros e zero avisos
  - pyright e pyrefly com zero erros nos arquivos tocados
  - ruff check e ruff format limpos em todo o conjunto modificado
  - jest 48 suites e 381 testes aprovados
  - pytest 1073 aprovados e 1 pulado
  - tests/test_credenciais.py com 6 aprovados, incluindo teste negativo do portao
  - gen_ranges.py produz saida identica byte a byte apos a anotacao
nao_verificado:
  - execucao ponta a ponta do hook de revisao de commit
  - o arquivo HTML modificado nao tem checker declarado no projeto
---

# HANDOFF -- Limpeza de lint, ciclo Lighthouse e renovacao do aceite de CVE

**Data:** 2026-09-10 - **Autoridade:** Raphael Vitoi (Tier 0)

## 1. Primeira coisa a fazer na proxima sessao

**O verde do portao e condicional.** Depende de duas coisas efemeras: o dev
server respondendo em localhost:3000, e pelo menos um alvo de tipo pagina no
Chrome que expoe CDP na 9222. Sem as duas, cwv.cobertura e a11y.cobertura voltam
como avisos.

Isso e honestidade do portao, nao regressao: sem navegador instrumentado ele se
recusa a emitir selo verde, e esta certo.

## 2. O ciclo do Lighthouse -- causa raiz

O sintoma relatado era que os dois avisos venciam e voltavam sempre.

**Parte disto ja tinha sido resolvida.** O REGISTRO-2026-09-09-o-arquivo-gerado-
que-expirava-o-certificado documenta uma causa diferente do mesmo sintoma:
next-env.d.ts era reescrito por next dev depois de cada auditoria e invalidava o
certificado por construcao. A correcao foi excluir aquele arquivo do fingerprint,
e ela continua valendo.

O que se mediu hoje e outra coisa, e complementar:

O artefato Lighthouse e vinculado a um fingerprint do frontend. Qualquer mudanca
o expira com LIGHTHOUSE_FINGERPRINT_MISMATCH. **Isso e o portao funcionando.**

A regeneracao e que estava bloqueada. A auditoria sobe um Chrome headless na
porta 9230; quando morre no meio, o headless fica orfao segurando a porta; e o
invoke_lighthouse_production_audit.ps1 se recusa -- corretamente -- a encerrar
processo que nao iniciou. Havia tres perfis de auditoria orfaos no temp.

Resultado: o artefato nunca regenerava. O portao nao estava sendo burlado;
estava sendo **impedido de medir**.

Entregue scripts/ops/Clear-LighthouseOrfaos.ps1. Ele so considera alvo o
processo que satisfaz as tres condicoes ao mesmo tempo: escuta a porta de
auditoria, usa perfil de auditoria, e tem processo-pai morto. Sem -Executar ele
apenas relata.

Quando o artefato vencer, rode o limpador e depois o orquestrador. Se o limpador
acusar acesso negado, e o caso encontrado hoje: o headless roda em nivel de
integridade acima da sessao e exige shell elevado. Contorno sem elevacao: passar
-CdpPort 9231 ao orquestrador.

O proprio orquestrador avisa quando nao consegue remover o perfil por lock do
Chrome em encerramento. O residuo e esperado; faltava quem o recolhesse.

## 3. Aceite de CVE do chromadb -- renovado, nao reaberto

O portao passou a acusar PYSEC-2026-3813, 3814 e 3815 como CVE sem aceite. O
aceite de 2026-09-08 cobria CVE-2026-45830, 45831 e 45833.

**Sao as mesmas quatro advisories, renumeradas.** Verificado pelo campo aliases
do proprio pip-audit. Nenhuma vulnerabilidade nova entrou, mesmo pacote e mesma
versao 1.5.9.

A evidencia de alcance **foi refeita**, nao reaproveitada: apenas
chromadb.PersistentClient embarcado, em memory_rag.py:208 e
scripts/utils/ingest_rag.py:28; zero HttpClient do Chroma e zero servidor. A
unica ocorrencia de HttpClient continua sendo do.ps1:776, do .NET. As quatro
vulnerabilidades sao todas da superficie do servidor HTTP, que este repositorio
nao usa.

O aceite foi estendido aos identificadores renumerados, com autoridade e data
originais preservadas. Nao e aceite novo. O contador PY_CVE_ACEITAS continua
mostrando as CVEs: aceite nao e supressao.

## 4. Lints corrigidos

| Arquivo | Achado | Correcao |
| :--- | :--- | :--- |
| scripts/utils/gen_ranges.py | 4 erros Pyrefly | TypedDict para o registro de mao |
| scripts/utils/ingest_rag.py | 1 erro | list de Metadata, alias do proprio chromadb |
| scripts/utils/read_any_docx.py | stubs ausentes | types-defusedxml declarado e instalado |

**Pyright e Pyrefly discordavam** em gen_ranges.py: 0 erros contra 4. Nao e bug
de nenhum. O dict literal misturava str em type e name com int no resto, e os
dois inferem literais heterogeneos de forma diferente. O remedio nao foi
silenciar o mais estrito, foi declarar a forma fixa que o registro ja tinha.
Depois disso os dois concordam.

Em ingest_rag.py a causa era invariancia de list: uma lista de dict de str nao e
atribuivel a uma lista de Mapping, mesmo com dict sendo Mapping.

gen_ranges.py gera codigo TypeScript; a saida foi comparada antes e depois e e
identica byte a byte.

## 5. Duas regressoes do passe de lint anterior

O passe de lint sobre o codigo da Astra introduziu duas regressoes que o HEAD
nao tinha:

- tools/hybrid_router/test_hybrid_router.py: o import de pydantic entrou depois
  da manipulacao de sys.path, sem o noqa E402 que o vizinho tem. Corrigido
  movendo o import para o bloco de topo, porque pydantic e pacote instalado e
  nao depende daquele sys.path. Corrigir e melhor que silenciar.
- agents/fallback.py: formatacao fora do padrao ruff. Reformatado.

Em tools/hybrid_router/plot_benchmark.py o passe havia removido o cast que o
commit 23e9840d ja tinha, reintroduzindo 1 erro e 2 avisos de Pyright. A versao
atual reune as melhorias do passe e o cast de volta, passa nos dois
verificadores, e roda ponta a ponta gerando imagem de 5832x3436.

## 6. Fragilidade conhecida, nao corrigida

tests/test_cwv_gate_truthfulness.py falha em 4 testes nesta maquina. **Nao e
regressao de ninguem**: o teste, o portao e os dois JSON que ele ecoa estao
identicos ao HEAD.

Causa: subprocess.run com text=True e sem encoding explicito. Sob codepage 850,
um travessao vindo de data/cwv_manual_review_records.json estoura a
decodificacao na thread leitora do subprocesso, o stdout vira None, e o erro que
a suite mostra fica dois niveis acima do que realmente quebrou.

Correcao proposta e nao aplicada: passar encoding utf-8 com errors replace nas
chamadas de subprocess.run daquele arquivo. Nao foi feito porque mexe num teste
de veracidade de portao, e isso pede decisao explicita.

## 7. Defeito encontrado no portao de ancora, e corrigido

O commit desta sessao foi **bloqueado** por "Credencial em texto claro detectada
(Chave Google)". Nao era chave.

O `data/PADROES_DE_CREDENCIAL.json` existe, por escrito, porque "duplicata de
regra de seguranca diverge por construcao". Ele eliminou a duplicata do TEXTO do
padrao, mas nao a da SEMANTICA:

| Consumidor | Operador | Sensivel a caixa |
| :--- | :--- | :--- |
| `tests/test_credenciais.py:80` | `re.compile(rx)` | sim |
| `scripts/ops/record_anchor_gate.ps1:126` | `-match` | **nao** |

O `-match` do PowerShell ignora caixa por padrao. Com isso, o padrao
`AIza[0-9A-Za-z_-]{35}` passava a casar `AiZa`, `aiza`, `AIZA`. Uma chave Google
real comeca **sempre** por `AIza` literal.

O gatilho concreto: `reports/cwv/latest_lighthouse_production.json` tem ~500 KB
de base64, e um trecho dele -- `...ccoYy8AiZaHQ3BTkbk7trF04S7...` -- casou. Zero
ocorrencias com o padrao aplicado corretamente; uma so ignorando caixa.

E reincidiria: o certificado Lighthouse e versionado de proposito (o `.gitignore`
nega `reports/cwv/*` justamente para deixa-lo passar), e todo artefato novo e
outro meio megabyte de base64.

**Corrigido para `-cmatch`**, o que APERTA a precisao -- e o que a
`_regra_de_precisao` da propria fonte pede, ao dizer que portao que cria ruido e
portao que sera ignorado. Contornar estava fora de questao; a Secao 3 da raiz proibe,
e a mensagem do portao diz o mesmo.

**Travado com teste**, porque a correcao sozinha nao impede a divergencia de
voltar: `test_o_portao_compara_com_sensibilidade_a_caixa` afirma que o portao usa
`-cmatch`, e `test_o_padrao_google_nao_casa_variacao_de_caixa` fixa o trecho
base64 concreto como regressao. Verificado com teste **negativo**: revertida a
correcao, o primeiro reprova; restaurada, os 6 passam.

## 8. Padrao que apareceu tres vezes num dia

| Registro | Vinculado a | Como venceu |
| :--- | :--- | :--- |
| Artefato Lighthouse | fingerprint do frontend | o frontend mudou |
| Aceite de CVE | IDs de vulnerabilidade | os IDs foram renumerados |
| Copias de relatorio entre escopos | nada, eram duplicatas | divergiram sozinhas |

**Vinculo estrito e design correto** -- e o que impede aceitar medicao velha como
nova. O registro de 2026-09-09 ja tinha chegado a metade disto para o caso do
Lighthouse; o que se acrescenta aqui e que o mesmo padrao aparece no aceite de
CVE e na duplicacao entre escopos, e que o gargalo pode estar na renovacao e nao
no vinculo. O que falta nos tres e renovacao: nada avisa que venceu, nada regenera, e
a pendencia vira permanente. Para cada vinculo estrito que se cria, vale
declarar quem o renova e o que acontece quando ninguem renova.
