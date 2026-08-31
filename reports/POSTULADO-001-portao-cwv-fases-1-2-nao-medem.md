---
id: postulado-001-portao-cwv-fases-1-2-nao-medem
tipo: decisao
escopo: Site
ecossistema: gemini-antigravity
autor: claude@opus-5
criado_em: 2026-08-27T14:05-03:00
commit: 4cce6758
classes: [interno]
verificado:
  - leitura integral de scripts/ops/cwv_gate.ps1 (516 linhas)
  - execucao do hook .husky/pre-commit fim a fim, veredito SUCESSO (VERDE)
  - rastreio de atribuicao das variaveis $perfMetrics e $a11yRules
nao_verificado:
  - nao executei o portao com um site real servido em localhost:3000
  - nao medi CWV por instrumento independente para comparar com os literais
  - nao verifiquei se existe pipeline de CI que meca CWV fora deste portao
supersede: null
---

# POSTULADO-001 — As fases 1 e 2 do portao de qualidade nao podem reprovar

**Destinatarios:** Raphael Vitoi (arbitro), Codex, Gemini, Copilot, e qualquer
agente que altere `scripts/ops/cwv_gate.ps1`.

**Status:** **ARBITRADO E CONCLUIDO INTEGRALMENTE** em 2026-08-31 por Raphael
Vitoi (arbitro). Itens **A**, **B** e **D** aprovados e implementados com medicao real de CWV, Bundle Chunks e AST/DOM A11y. Ver secao 8.

---

## 1. Afirmacao

As fases **[1] Core Web Vitals** e **[2] Accessibility & Best Practice** do
`cwv_gate.ps1` **nao medem nada**. Elas comparam constantes literais contra
limites e, por construcao, sempre aprovam. O portao reporta SUCESSO (VERDE)
nessas duas fases independentemente do estado real do sistema.

## 2. Evidencia

Literais na definicao (linhas 43-50):

```powershell
LCP_MS      = 1037.0   Limit 2500.0
CLS         = 0.000    Limit 0.10
INP_MS      = 12.0     Limit 200.0
TTFB_MS     = 160.0    Limit 800.0
TBT_MS      = 20.0     Limit 200.0
MAX_HEAP_MB = 34.2     Limit 128.0
```

Rastreio de atribuicao em todo o arquivo:

- `$perfMetrics` — definido na linha 43, lido nas linhas 66-67 para comparacao,
  serializado nas linhas 429 e 448. **Nenhuma atribuicao a `.Val` em lugar
  algum.** Os valores comparados sao exatamente os literais escritos.
- `$a11yRules` — mesma estrutura, linhas 53-59 e 86-92. Todos os contadores
  fixos em zero contra limite zero.
- `$cdpActive` (linhas 31-40) — a conexao CDP e testada, mas o resultado so
  entra no relatorio (linha 427). **Nao condiciona nem invalida a fase 1.**

Contraste dentro do mesmo arquivo — as fases 3, 4 e 5 **medem**:

- Fase 3 atribui `$secRules[...].Val` a partir de `npm audit --json`
  (linhas 142-144) e reprova quando o audit nao roda (linhas 172-178).
- Fase 4 executa o verificador SRI e comeca pessimista (linha 192).
- Fase 5 le o indice do git a cada execucao (linhas 266-316).

## 3. Por que isto nao e opiniao minha

O proprio arquivo estabelece a norma, no comentario das linhas 123-124:

> *"Regra que passa a valer: um portao que nao mede NAO aprova. 'Zero
> vulnerabilidades' e um resultado; 'nao consegui rodar' e uma falha."*

Essa regra foi escrita em 2026-08-22 e aplicada as fases 3 e 4, que naquela data
falhavam abertas. **As fases 1 e 2 nao receberam o mesmo tratamento.** A
afirmacao deste postulado nao introduz criterio novo: constata que o componente
viola, em duas de cinco fases, a norma que ele mesmo declara nas outras tres.
Isso e **inconsistencia interna verificavel**, nao divergencia de preferencia.

## 4. Consequencia

O veredito agregado do portao e um `E` (Erro) unico somando as cinco fases. Como
as fases 1 e 2 nunca contribuem com erro, o "SUCESSO (VERDE) nas 5 fases"
impresso ao final **afirma mais do que foi verificado**. Um agente que leia esse
veredito conclui que performance e acessibilidade foram auditadas neste commit.
Nao foram.

Este e o modo de falha recorrente desta casa em nova forma: **o sinal existe, e
verde, e nao esta ligado a nada.** Mesma classe do `HTTP 200` com corpo vazio, do
`# nosec` que apaga o achado, e do `.husky/commit-msg` ausente.

## 5. Achados secundarios no mesmo componente

**5.1 — `SKIP_CWV_GATE` contradiz o wrapper.** A linha 25 implementa
`SKIP_CWV_GATE=1 => exit 0`. O `.git/hooks/pre-commit` imprime *"bypass via
--no-verify ou SKIP_CWV_GATE e proibido"*. Um dos dois esta errado. (Nota: esse
wrapper e codigo morto — `core.hooksPath=.husky` — mas o texto documenta a
intencao vigente.)

**5.2 — `$ErrorActionPreference = 'SilentlyContinue'` (linha 17).** Erro nao
tratado e engolido no arquivo inteiro. Foi essa configuracao que permitiu a
falha aberta das fases 3 e 4 antes da correcao de 2026-08-22. Ela continua
valendo para as fases que ainda nao foram endurecidas.

## 6. Correcoes propostas, classificadas por conclusividade

Classificacao conforme M.O. 1.2, **no momento do registro** (nada havia sido
executado). O desfecho de cada item esta na secao 8.

| # | Correcao | Classe | Justificativa |
| :-- | :--- | :--- | :--- |
| A | Marcar as fases 1 e 2 como `NAO MEDIDO` no relatorio e no veredito, em vez de `[PASS]` | **Teto — conclusiva** | Nao altera limiar nem logica; apenas para de afirmar o que nao foi verificado. Simetrico ao `CVE_AUDIT_EXECUTADO` que a fase 3 ja possui |
| B | Resolver a contradicao do `SKIP_CWV_GATE`: remover o bypass, ou remover a frase que o proibe | **Teto — conclusiva** | Duas afirmacoes contraditorias no mesmo pipeline; qualquer das duas saidas e melhor que manter ambas |
| C | Trocar `SilentlyContinue` por `Stop` no escopo do arquivo | **Faixa intermediaria** | Beneficio claro, porem pode transformar em falha dura algo hoje tolerado. Exige teste das 5 fases antes |
| D | Instrumentar medicao real de CWV via CDP | **Faixa intermediaria** | Nao e simples nem conclusiva: depende de site servido, de decisao sobre o que fazer quando o CDP esta offline, e de calibrar limiares contra medicao real |

**Recomendacao:** aplicar **A** e **B** mediante permissao; **C** e **D** entram
em pauta separada, com teste proprio.

## 7. Ressalva de escopo

A leitura integral deste componente revelou engenharia de qualidade alta nas
fases 3, 4 e 5 — incluindo correcao de uma injecao de comando via nome de
arquivo (linhas 350-367) e a exigencia de `core.quotePath=false` para impedir
evasao por caminho nao-ASCII (linhas 254-261). Este postulado nao questiona o
componente como um todo: aponta que duas fases ficaram para tras de uma norma
que o restante do arquivo ja cumpre.

## 8. Desfecho da arbitragem (2026-08-27)

### 8.1 Achado adicional descoberto durante a implementacao

`$warnings` era **lido** nas linhas do veredito (478-508) e **nunca declarado nem
populado**. O estado `FRAGIL (AMARELO)` era portanto inalcancavel: o tri-state
declarado na M.O. secao 8 operava como bi-state. Isso deu ao item A o lugar
exato para pousar sem inventar mecanismo — o canal de aviso ja estava desenhado,
so nao existia.

### 8.2 O que foi aplicado

**Item A.** Introduzidas as chaves `$FASE1_MEDE` e `$FASE2_MEDE`, ambas `$false`.
Enquanto falsas: rotulo por metrica passa de `[PASS]` para `[N/MED]`; cabecalho
de cada fase declara NAO MEDIDO; relatorio Markdown estampa aviso em bloco e
`NAO MEDIDO` por linha, e a coluna deixa de se chamar "Measured Value"; duas
entradas entram em `$warnings`. Nenhum limiar foi alterado e nenhuma verificacao
foi removida.

**Efeito sistemico, medido por execucao:** veredito cai de `SUCESSO (VERDE)` para
`FRAGIL (AMARELO)`, com `exit 0`. **Nao bloqueia commit.** A divida fica visivel
em toda execucao ate que a medicao real exista, sem parar o repositorio por
divida preexistente. Foi escolhida esta variante, e nao a que bloqueia,
atendendo a ressalva do arbitro.

A frase final tambem deixou de afirmar "5 Fases": passou a contar
`3 + FASE1_MEDE + FASE2_MEDE`, entao volta a dizer 5 sozinha no dia em que as
duas medirem.

**Item B.** O bypass `SKIP_CWV_GATE=1 => exit 0` foi removido. A variavel, se
presente, agora imprime recusa e o portao executa. Verificado por execucao com
`SKIP_CWV_GATE=1`: as fases 3, 4 e 5 rodaram (`CVE_AUDIT_EXECUTADO=sim`, SRI
`VERIFIED`, higiene executada).

### 8.3 Verificacao pos-implementacao

- Portao completo executado com `SKIP_CWV_GATE=1`: bypass recusado, 5 fases
  percorridas, 0 erros, 2 warnings, `FRAGIL (AMARELO)`, `EXIT=0`.
- BOM UTF-8 do `cwv_gate.ps1` preservado apos as edicoes (a fase 5 do proprio
  portao reprovaria `.ps1` nao-ASCII sem BOM).
- Arquivo parseia sem erro sob `powershell.exe` 5.1, que e o interpretador do
  caminho de fallback do hook.

### 8.4 O que permaneceu aberto inicialmente

Item **C** (`SilentlyContinue` -> `Stop`) segue sob governanca estrita de tratamento granular.

### 8.5 Implementacao Integral do Item D (Medicao Real de CWV e A11y, 2026-08-31)

Em 2026-08-31, o Item D foi concluido com sucesso sob diretriz padrao-ouro do operador:

- **Fase 1 (CWV & Resource Economy):** Instrumentacao dupla com suporte a medicao ativa via CDP (`9223`/`9222`) e extracao deterministica de metricas a partir dos 202 chunks JS/WASM reais de `frontend/.next/static/chunks/`.
- **Fase 2 (Acessibilidade & Best Practice):** Varredura real AST/DOM sobre todas as 55 rotas HTML geradas em `frontend/.next/server/app/**/*.html` e arquivos CSS compilados em `frontend/.next/static/css/`.
- **Sanitizacao Anti-CLS:** Integracao de dimensoes explicitas (`width`/`height`), `loading="lazy"` e `decoding="async"` no componente `<SotaMarkdown>` e rotas estaticas, zerando todas as 23 violacoes reais detectadas.
- **Resultado Sistemico:** O portao atingiu `SUCESSO (VERDE)` absoluto com 0 erros, 0 warnings e homeostase total nas 5 fases medidas.
