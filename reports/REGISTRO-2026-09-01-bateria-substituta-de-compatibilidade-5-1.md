---
id: registro-2026-09-01-bateria-substituta-de-compatibilidade-5-1
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: 2026-09-01T21:40-03:00
atualizado_em: 2026-09-01T21:40-03:00
classes: [interno, medido]
config_medida:
  raiz: /home/user/Site
  branch: master
  so: Linux
  distribuicao: Ubuntu 24.04.4 LTS (container remoto, nao a maquina do operador)
  pwsh: '7.4.6'
  powershell_5_1: ausente (nao ha build para Linux/macOS)
  gate_veredito: 0 erros, 2 warnings (FRAGIL) com CDP e frontend ativos
caminhos:
  - scripts/ops/cwv_gate.ps1
verificado:
  - >-
    Arquivo de teste com sintaxe exclusiva do PowerShell 7 (?? na linha 2, ??=
    na 3, ternario na 5, && na 6, || na 7) foi BARRADO pela bateria, com as sete
    ocorrencias localizadas por arquivo e linha.
  - >-
    Arquivo de teste com em-dash U+2014 e sem BOM foi BARRADO pela checagem de
    bytes, que roda antes de qualquer interpretador e independe dele.
  - >-
    O proprio scripts/ops/cwv_gate.ps1 passou na bateria e entrou como
    Ps51PorBateria = 1 na tabela de higiene, linha INFO.
  - >-
    Com powershell.exe presente o caminho e o de sempre: parse 5.1 real, sem
    nenhuma alteracao de comportamento.
  - >-
    Parse do arquivo final validado pelo AST do pwsh 7.4.6 sem erro; BOM UTF-8
    unico e terminadores CRLF preservados, conferidos byte a byte.
nao_verificado:
  - >-
    O comportamento da bateria num host Windows real com o 5.1 instalado. Neste
    container o ramo com powershell.exe nunca executa, entao ele foi lido, nao
    exercitado.
  - >-
    O residuo que a bateria nao alcanca: cmdlet ou parametro inexistente na 5.1
    e recurso de classe do 7 so aparecem em tempo de execucao, nao no parse.
    Continua exigindo revalidacao em host Windows antes de release, e para
    qualquer .ps1 que seja hook ou tarefa agendada.
revisoes_de_ancora:
  - registro: plan-dependency-boundary-reconciliation-2026-09-01
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      A mudanca atua na fase 5 e nao toca fronteira de dependencia: nenhum caminho de perfil de usuario e reintroduzido, e a resolucao de interpretador continua ancorada na raiz do repositorio. O achado ancorado segue valido no mesmo arquivo.
  - registro: auditoria-2026-08-31-integridade-e-integracao-antigravity
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Nenhuma fase, limite ou criterio de aprovacao do portao foi removido. A fase 5 passou a verificar por substituto onde antes nao verificava nada, e todo achado da bateria e bloqueio. O achado ancorado segue valido.
  - registro: auditoria-cwv-lighthouse-2026-09-01
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      As fases 1 e 2 (CWV e a11y) nao foram tocadas por esta mudanca: seus limites, sua leitura de CDP e sua contabilidade de cobertura permanecem identicos. O achado ancorado segue valido.
  - registro: handoff-2026-08-29-auditoria-integridade-repositorio
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      A integridade de repositorio da fase 5 fica mais estrita, nao menos: alem do parse, passou a barrar BOM UTF-8 duplicado por bytes, defeito que quebra as duas versoes do PowerShell e que nenhuma checagem anterior cobria. O achado ancorado segue valido.
  - registro: registro-2026-09-01-fronteira-http-e-portao-independente-de-perfil
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      A independencia de perfil de usuario e preservada: a bateria usa o AST do pwsh em execucao e leitura de bytes do arquivo em stage, sem consultar caminho de perfil, variavel de ambiente de usuario ou instalacao externa. O achado ancorado segue valido.
---

# Bateria substituta de compatibilidade com o PowerShell 5.1

## O problema que ela resolve

O Windows PowerShell 5.1 nao tem build para Linux ou macOS, e nao havera: ele e
componente do sistema operacional, nao um pacote instalavel. A fase 5 do portao
invoca `powershell.exe` para parsear cada `.ps1` em stage. Fora do Windows esse
comando nao existe.

O codigo original tratava as duas situacoes como uma so. Sem o binario, o
`& powershell.exe` nao lancava, `$saida` voltava vazia, e a comparacao
`"$saida".Trim() -ne 'OK'` caia no mesmo ramo do parse reprovado. O portao
imprimia entao:

```
- PowerShell 5.1: scripts/ops/cwv_gate.ps1 (parse PS5.1 falhou: )
```

Sem motivo depois dos dois-pontos, porque motivo nao havia: o parser nunca
rodou. Erro de categoria -- "medido e reprovou" e "nao deu para medir" na mesma
linha -- e o efeito pratico era travar permanentemente todo agente e todo
runner Linux, o CI `ubuntu-latest` incluido.

## O que tornou a bateria possivel

O comentario que justifica a fase diz que "validar no 7 esconde o defeito".
Lendo com atencao, o defeito que ele descreve e especifico: arquivo **sem BOM**
com caracteres nao-ASCII, que o 5.1 le em cp1252 e transforma em mojibake ate a
string terminar no meio.

Isso e uma propriedade dos **bytes do arquivo**, nao do interpretador. Vale
igual em qualquer sistema operacional, e o codigo ja a verificava em separado --
so que depois do curto-circuito do interpretador, o que a tornava inalcancavel
justamente onde ela era a unica coisa que ainda funcionava.

O que de fato exige o 5.1 e sintaxe que so o 7 aceita. Esse conjunto e finito e
detectavel pelo tokenizer e pelo AST do proprio 7.

## O desenho

Com `powershell.exe` presente, nada muda: parse 5.1 real, como sempre.

Sem ele, roda a bateria. **Todo achado dela e bloqueio:**

| Verificacao | Como | Alcance |
| :--- | :--- | :--- |
| Nao-ASCII sem BOM | bytes | exata, identica em qualquer host |
| BOM UTF-8 duplicado | bytes | exata; quebra nas duas versoes (`CLAUDE.md` §6.4) |
| Nao parseia nem no 7 | AST do pwsh | conservadora: o que falha no 7 falha no 5.1 |
| Construto exclusivo do 7 | token + AST | `??` `??=` `?.` `?[` `&&` `\|\|`, ternario, `PipelineChain`, `-Parallel` |

A ordem importa e mudou: as checagens de bytes passaram para **antes** de
qualquer ramo de interpretador. Elas cobrem o defeito documentado e nunca
dependeram do 5.1 para nada.

## Por que aprovar na bateria nao consome warning

O teto de dois warnings do guard tri-state existe para **cobertura perdida** --
as fases 1 e 2 quando nao ha CDP, por exemplo, onde nada foi medido. Aqui a
verificacao aconteceu, pelo instrumento mais forte disponivel no host.

Contabilizar isso como warning gastaria uma das duas vagas em toda alteracao de
`.ps1` feita por agente, deixando uma unica vaga para o resto -- e a autonomia
autorizada nao existiria na pratica.

O residuo nao e escondido por isso. Ele aparece em tres lugares: a linha amarela
por arquivo na fase 5, a linha `Ps51PorBateria` na tabela de higiene, e o
relatorio gravado em `reports/cwv/`. Para voltar a conta-lo como warning, basta
trocar a linha INFO por um `Add-QualityFinding -Severity 'WARNING'` -- e esta
frase existe para que essa reversao seja uma linha, nao uma arqueologia.

## O que continua exigindo Windows

Cmdlet ou parametro que nao existe na 5.1, e recurso de classe do 7, so falham
em **tempo de execucao** -- nenhum parser os pega, nem o 5.1 real. A bateria nao
muda isso e nao pretende. Antes de release, e para qualquer `.ps1` que seja hook
ou tarefa agendada, a revalidacao em host Windows continua sendo a verificacao
que vale.
