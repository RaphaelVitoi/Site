---
id: handoff-2026-09-08-forense-fechada-e-o-sentinela-em-vigilia
tipo: handoff
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-08-contraste"
criado_em: 2026-09-08T18:00:00-03:00
atualizado_em: 2026-09-08T18:35:00-03:00
classes: [interno, medido, handoff, forense, pmev, observabilidade]
caminhos:
  - scripts/ops/sentinela_delecoes.ps1
  - tests/test_sentinela_delecoes.py
  - docs/architecture/NODELOCKING_B20_ARCHITECTURE.md
supersede: null
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
  pwsh: '7.6.5'
verificado:
  - >-
    ESTADO FINAL: master em 4ee69c64, sincronizado com origin, working tree
    limpa. Suite Python 1000 passed / 1 skipped em 226,01 s, zero warnings.
  - >-
    SENTINELA EM VIGILIA: rodando a partir de scripts/ops/sentinela_delecoes.ps1
    (a versao versionada, nao a do scratchpad), vigiando .claude/RELATORIOS e
    logs/, gravando em %TEMP%/sentinela_delecoes.jsonl. Validado por teste
    funcional com isca antes de ser declarado ligado.
  - >-
    DEV SERVER na porta 3000 mantido ligado por instrucao permanente do Tier 0.
nao_verificado:
  - >-
    O SENTINELA NAO SOBREVIVE A REBOOT. E de proposito: registrar tarefa
    agendada e mudanca de sistema e exige autorizacao. Se a maquina reiniciar, a
    proxima sessao precisa religa-lo -- e sem ele a quarta ocorrencia passa
    despercebida como as tres anteriores.
  - >-
    A CAUSA DAS TRES DELECOES segue desconhecida. A hipotese do Tier 0 (extensao
    do Google Cloud) tem lastro circunstancial e nao tem prova.
---

# Handoff -- forense fechada ate onde o instrumento alcanca, sentinela em vigilia

## 1. Onde o repositorio esta

`master` em **`881b67bd`**, sincronizado, working tree limpa. Suite Python
**1000 passed / 1 skipped**, zero warnings. Portao de 5 fases verde em todos os
commits desta etapa.

> **Emenda de fechamento.** Este handoff foi escrito em `4ee69c64` e dois commits
> vieram depois: `38ce7211` (auditoria da sessao e este handoff) e `881b67bd`
> (feedback 9.5 no ledger e o registro do padrao de desvio de foco). O estado
> acima e o medido no fim, nao no momento da escrita.

## 2. O que esta rodando agora

| Recurso | Estado |
| :--- | :--- |
| Sentinela de delecoes | **ATIVO**, de `scripts/ops/sentinela_delecoes.ps1` |
| Saida do sentinela | `%TEMP%/sentinela_delecoes.jsonl` -- **1 linha, e ela NAO e evento** |
| Dev server | porta 3000, mantido ligado por instrucao permanente |
| CDP | 9222 e 9224 ativas; 9230 livre |

**A primeira linha do JSONL e a isca de controle**, nao uma ocorrencia real:
`logs\__isca_sentinela.tmp`, 6 bytes, 08/09 17:34:46 -- foi a validacao que
provou que o instrumento captura. **Evento real comeca na linha 2.** Ler a linha 1
como ocorrencia seria repetir, no instrumento, o erro que ele existe para evitar.

**Se a maquina reiniciou entre as sessoes, o sentinela morreu.** Religar com:

```powershell
Start-Process pwsh -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-File','scripts\ops\sentinela_delecoes.ps1' -WindowStyle Hidden
```

## 3. O que ficou aberto, em ordem de prontidao

1. **A calibracao assistida do padrao de desvio de foco.** O portao de
   suficiencia da §8.3 esta ABERTO -- quatro sessoes distintas, duas condutoras,
   confirmacoes independentes nas sequencias 19 e 20. O registro
   `registro-2026-09-08-o-padrao-de-desvio-de-foco` traz o diagnostico e tres
   mecanismos ordenados; **quem conduz a calibracao e o Tier 0.** Os mecanismos
   M1 e M2 valem desde ja e nao dependem de calibracao: precificar o desvio antes
   de executa-lo, e declarar saldo de orcamento a cada frente nova.
2. **A quarta ocorrencia da delecao.** Nao ha o que fazer ate ela acontecer. Se
   o JSONL do sentinela tiver linha **a partir da segunda**, o primeiro trabalho
   da proxima sessao e cruzar os suspeitos com o padrao do USN -- e so ha padrao
   se `logs/task_executor.log` cair junto de novo.
3. **As duas divergencias do Nodelock B20.** `entrapment ratio +20%` e o
   acoplamento de `b20Effectiveness` a kappa estao na espec e nao no codigo.
   Decisao de produto, nao de engenharia.
4. **`countReproduciblePairs` = 0/7** no contraste ICMev x ChipEV. Exige
   recaptura das fontes.
5. **A escolha entre as duas grandezas de Risk Premium.** Aguarda o Tier 0.
6. **O defeito de modelagem do `signDelta`** -- um parametro servindo a dois
   eixos. Sete pares irreproduziveis nao autorizam corrigi-lo.
7. **Sete achados do Astra em aberto:** B05, B07, B08, B09, F03, F05, F06.

## 4. O que NAO refazer

- **O recorte do fingerprint do Lighthouse ja foi feito** (`4a9867a4`).
- **A espec do Nodelock B20 ja foi restaurada** (`6745cdcb`), em
  `docs/architecture/`. Os outros oito documentos apagados em `a22df57e` foram
  auditados um a um e sao redundancia, obsolescencia ou lixo -- **nao restaurar**.
- **O sentinela ja esta versionado e testado** (`4ee69c64`).

## 5. Prompt de continuacao

> Antes de qualquer coisa, cheque duas medidas e declare as duas: se
> `%TEMP%/sentinela_delecoes.jsonl` tem linha **alem da primeira** -- a linha 1 e
> a isca de controle, nao evento --, e se o processo do sentinela ainda vive. Se
> morreu, religue-o; se ha linha nova, ela e a prioridade da sessao e vem antes
> de tudo, porque e o unico dado do mundo sobre uma causa que tres sessoes
> registraram como desconhecida.
>
> **E declare seu orcamento antes da primeira linha de codigo, com uma regra que
> a sessao passada nao teve: a cada frente nova, uma linha dizendo quanto do
> orcamento ela consome e se ela e bloqueante.** Quando o Tier 0 pedir algo fora
> do mandato, precifique ANTES de virar a chave e ofereca a fila -- uma vez,
> curta. Quatro feedbacks seguidos apontam desvio de foco, e o mecanismo de maior
> impacto e exatamente esse, de raio zero. Ver
> `registro-2026-09-08-o-padrao-de-desvio-de-foco`.
>
> **Nao reabra o que ja foi medido.** O recorte do fingerprint, a restauracao da
> espec do B20 e a triagem dos nove documentos apagados estao fechados e
> declarados; refaze-los e desperdicio, e reabrir a triagem seria pior, porque
> oito daqueles arquivos foram apagados com razao.
>
> Sem linha nova no sentinela, a fila e a §3 deste handoff, na ordem em que ela
> esta -- e a primeira decisao que nao e minha e a escolha entre as duas
> grandezas de Risk Premium, que espera o Tier 0.
>
> Uma advertencia de metodo que esta sessao pagou caro para aprender: antes de
> declarar qualquer instrumento funcionando, **prove com isca**. A primeira
> versao do sentinela falhou em silencio e teria passado por boa.

---

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Proposito:** entregar a proxima sessao com o sentinela em vigilia, a fila
ordenada por prontidao, e o que ja foi medido explicitamente fora de escopo.
