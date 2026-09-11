---
id: handoff-2026-09-11-o-alvo-declarado-e-o-objeto-que-o-github-ainda-serve
tipo: handoff
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-11T00:08:22-03:00'
atualizado_em: '2026-09-11T00:08:22-03:00'
classes: [interno, medido, handoff, seguranca, calibracao]
verificado:
  - cinco commits enviados -- quatro na raiz e um no Site -- ambos os remotos em sincronia
  - o remoto publico do Site entrega o commit orfao cfd0d2c7 por SHA, medido por fetch
  - o artefato exposto nao parseia como chave privada -- ssh-keygen devolve invalid format
  - nenhum blob de 300 a 600 B no banco de objetos e chave privada OpenSSH, em 1.707 candidatos
  - New-GitHubGcRequest.ps1 testado nos dois ramos, com SHA real e com SHA inexistente
  - os dois portoes de registro aprovaram este commit e o anterior
nao_verificado:
  - nenhum dos 15 scripts da raiz foi executado -- alvo verificado nao e execucao validada
  - nao testei se allow-git=root faria os dois MCPs subirem; medir exigiria aplicar o relaxamento
  - nao verifiquei se a chave de 198 B chegou a ser cadastrada em algum servico
  - nao existe validador oficial para o ledger de outlier -- cadeia conferida por script proprio
  - Finalizar-PromocaoAdmin.ps1 nao foi executado -- 28 processos do Chrome vivos
caminhos:
  - reports/HANDOFF-2026-09-10-raiz-versionada-e-o-portao-que-media-outra-pagina.md
  - reports/REGISTRO-2026-09-11-fechamento-automatico-do-dia-10-e-o-outlier-sem-sessao.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
revisoes_de_ancora: []
---

# Handoff — o alvo declarado, e o objeto que o GitHub ainda serve

**Estado:** raiz em `b95f34f`, `Site` em `c5604220`. Ambos limpos e em sincronia.
Cinco commits desde o handoff anterior: quatro na raiz, um aqui.

---

## 0. Por que este handoff tem `revisoes_de_ancora` vazio, tendo editado outro

Editei uma linha do handoff de 10/09, e escrevi dois pareceres de ancora para
declarar isso. **O portao de registro rejeitou, e estava certo.** Os `caminhos` de
uma revisao de ancora sao as **ancoras compartilhadas** -- caminhos que o registro
revisado declara e que este commit toca. Medido: o handoff de 10/09 ancora em
`frontend/src/app/api/v1/search/route.ts` e em
`reports/agent-calibration/feedback-ledger.jsonl`, e este commit nao toca nenhum
dos dois. Eu havia listado o caminho do proprio documento revisado, que nao consta
do `caminhos` dele.

Logo **nao havia reconciliacao a fazer, e eu a fabriquei.** Editar um registro nao
e, por si, relacao de ancora -- ancora e dependencia declarada sobre um artefato,
nao proximidade entre documentos. Parecer desnecessario e primo do parecer
generico que a secao 1.2 proibe: ocupa o lugar de uma afirmacao verificavel com
uma que nao mede nada. O que aqueles pareceres diziam de util esta na secao 1 e na
secao 6, onde e prosa e nao metadado.

---

## 1. O que este handoff fecha

O handoff de 10/09 terminou com **uma** frente aberta: os 15 scripts da raiz sem
consumidor, com ausencia de invocacao medida e obsolescencia nao determinada.
Fechou. Mas fechou trocando a pergunta, nao respondendo aquela.

**A pergunta "quem invoca este arquivo?" nunca ia decidir nada**, porque ausencia
de consumidor e candidatura a revisao e nao prova de obsolescencia. A pergunta que
decide: **todo script declara o proprio alvo, e alvo e verificavel.** Alvo morto
decide pela remocao mesmo sem consumidor; alvo vivo decide pela permanencia mesmo
sem consumidor.

Resultado de 11 verificacoes de alvo: **14 ficam, 1 em quarentena, nenhum
removido.** A obsolescencia nao foi confirmada -- foi desmentida em todo caso em
que havia alvo a verificar. E **tres dos 15 eram atas de operacoes inacabadas.**

O unico movido foi `list_extensions.py`, por supersessao medida:
`scripts\ops\inventario-extensoes.ps1` enumera todos os perfis, resolve nome real
via `_locales`, versao, manifest version e permissoes. Superconjunto estrito. O que
parecia gemeo dele, `scan_injectors.py`, ficou: mapeia `content_scripts`, e nenhum
script de ops cobre isso. Trinta linhas de distancia entre os dois.

---

## 2. O achado que importa mais que tudo nesta sessao

Ao verificar se o alvo de `PROCEDIMENTO_FILTER_REPO_C05.ps1` havia sido cumprido,
medi o remoto. **`github.com/RaphaelVitoi/Site`, publico, ainda entrega o commit
orfao `cfd0d2c7f3943f4c4fe1e415cd23b7d3b32f3443` por SHA.** O `fetch` resolveu.

**Reescrever historico e forcar push nao apaga objeto no GitHub** -- torna
inalcancavel por nome. O objeto segue servido por SHA ate coleta de lixo do lado
deles, que nao ocorre por conta propria.

### 2.1 A gravidade, medida em vez de presumida

O artefato nao e chave utilizavel: 198 B, tres linhas, **sem linha
`-----END OPENSSH PRIVATE KEY-----`**, `invalid format` no `ssh-keygen`; ~120 B
decodificados contra os ~310 que uma Ed25519 exige. Varredura de **1.707** blobs
de 300-600 B em todo o banco -- alcancaveis e inalcancaveis -- nao achou chave
privada completa alguma. A chave viva em `~\.ollama` e outra, 387 B, e nunca foi
commitada.

**Nao e incidente de credencial. E residuo de higiene**, e importa porque a proxima
vez pode nao ser um toco.

### 2.2 O que fazer, e e do Tier 0

```
pwsh -File C:\Users\rapha\.gemini\scripts\ops\New-GitHubGcRequest.ps1 -AbrirNavegador
```

O script **remede antes**: se o remoto ja nao entregar o commit, diz para nao abrir
ticket e sai. Copia o pedido para a area de transferencia, sem caminho e sem
conteudo do artefato -- o ticket seria mais um lugar onde o dado passaria a
existir. Avisa tambem se o commit voltou a ser alcancavel por ref local, caso em
que pedir coleta seria inutil porque o proximo push recoloca o objeto.

Falta tambem confirmar se aquele par de 198 B chegou a ser cadastrado como deploy
key ou em `authorized_keys`. Se sim, revogar.

---

## 3. Duas frentes fechadas por recusa fundamentada

Incomum, e deliberado: medir nao serviu para achar o que consertar, serviu para
provar que dois consertos eram piores que os defeitos.

### 3.1 Os MCPs `dak` que falham a cada sessao

Causa raiz: `npm error code EALLOWGIT`. O npm 12.0.2 traz `allow-git = "none"` como
**valor padrao de fabrica** -- ninguem configurou -- e `notebook` e `visualization`
se instalam por `npx -p git+...` de um pacote que da `E404` no registro. Dos 10
servidores do plugin, **8 rodam proxy empacotado e funcionam**; so esses dois saem
buscar codigo por git. A causa e a montante.

**Nao relaxei `allow-git`.** Valores aceitos: `all`, `none`, `root`. Qualquer um
diferente de `none` permite executar codigo vindo de URL git na maquina inteira.
Duas capacidades nunca invocadas nao pagam um controle permanente de cadeia de
suprimentos.

**Condicao de reversao:** o pacote ser publicado no registro, ou o plugin empacotar
esses dois como faz com os oito. Nenhuma depende desta maquina, e por isso o item
esta **fechado**, nao em aberto -- nao ha acao local correta a tomar.

Nao suprimi o aviso recorrente: nao consegui verificar qual chave desabilita um
servidor MCP individual neste instalador, e chave inventada seria conserto fingido.

### 3.2 A promocao do perfil Admin do Chrome

Tres razoes independentes, cada uma suficiente:

1. **28 processos `chrome.exe` vivos**; o script exige Chrome fechado.
2. Renomear `User Data - Admin` quebra **tres consumidores**, e um deles --
   `Launch-ChromeSOTA.ps1` -- e alcancado por 2 atalhos `.lnk` fora do repositorio
   mais 1 backend em `extensions\`, que o `.gitignore` exclui. Git nao avisaria,
   porque para ele nada quebrou.
3. O script abre declarando o estado dos perfis, e o retrato **envelheceu 3,2 GB**:
   `User Data - SOTA` passou de 6.673 MB declarados para 9,9 GB medidos.

Intencao retirada. O script fica como documentacao do estado parcial. Quem retomar
remede antes, e migra os tres consumidores no mesmo ato.

---

## 4. O fechamento automatico do dia 10

Encontrei a arvore do `Site` suja ao conferir limpeza. Nao era minha: e o ciclo de
fechamento do dia local 10/09, disparado 23:59:37 e gravado 00:00:39 de 11/09.
Versionado em `c5604220` com reconciliacao de ancora. Detalhe que confirma uma
correcao anterior: o gerador escreve o `.json`, e o diario em markdown e **autoral
de agente** -- era essa a distincao.

A sequencia 5 do ledger de outlier retem o feedback `277d4f23`, nota 9,5, com
**`session_id` vazio**, `pattern_indexed` falso, sem adivinhar identificador.
Comportamento correto: inventar o ID inflaria a contagem de sessoes distintas, que
e a metrica que autoriza calibracao. Ver
`REGISTRO-2026-09-11-fechamento-automatico-do-dia-10-e-o-outlier-sem-sessao.md`.

---

## 5. O que fica aberto

| Frente | Estado |
| :--- | :--- |
| Coleta de lixo no remoto publico do `Site` | **ABERTO.** Unico item que exige acao do Tier 0. Rodar `New-GitHubGcRequest.ps1`; exige sessao autenticada no Suporte |
| A chave de 198 B ja foi cadastrada em algum servico? | **ABERTO.** Exige consoles externos |
| `Finalizar-PromocaoAdmin.ps1` | **fechado por decisao de nao fazer.** Se reaberto, remedir e migrar 3 consumidores no mesmo ato |
| MCPs `dak` `notebook` e `visualization` | **fechado por recusa.** Reabre sozinho se o pacote for publicado no registro |
| Validador do ledger de outlier | **declarado inexistente, sem conserto.** Cria-lo seria o agente construindo o instrumento que mede o proprio registro (10.3) |
| `quarantine\raiz-soltos-20260910\` | vence **2026-10-10**. Idade e condicao necessaria, nunca suficiente |

---

## 6. Para quem pegar isto depois

**Nao refaca a pergunta do consumidor nos 15 scripts.** Ela foi medida tres vezes e
nao decide. Se precisar revisitar, o criterio e o alvo declarado, e os alvos estao
tabelados em
`relatorios\RELATORIO_DECISAO_SCRIPTS_SEM_CONSUMIDOR_2026-09-10.md` secao 3, na raiz.

**Tres armadilhas de medicao que custaram tempo hoje, todas gravadas no `CLAUDE.md`
da raiz:**

1. **Carimbo de tempo de arquivo e a primeira vitima da propria auditoria.** Quatro
   dos 15 apareceram modificados e dois criados "hoje" porque eu os li e o git os
   reescreveu normalizando finais de linha.
2. **`antigravity\brain\` contamina toda varredura.** Uma busca por
   `User Data - Admin` devolveu 20 resultados e 16 eram transcricao de agente ali
   dentro. Sinal-ruido de 1 para 4.
3. **A ferramenta responde certo a pergunta errada.** `ssh-keygen -l` respondeu
   sobre a ausencia de um `.pub` e nao sobre a validade da chave -- precisei de
   `-y`. E `git mv` rastreou um arquivo dentro de `quarantine\`, que o `.gitignore`
   exclui, porque `git mv` forca rastreio.

**Uma correcao minha, marcada e nao apagada.** No commit `3707802` eu liguei o
`sota_mcp_pipe_daemon` aos MCPs `dak` que falhavam. Errado: sao stdio, nao named
pipe, e a causa e `EALLOWGIT`. Era coincidencia de nomenclatura -- o mesmo erro que
aquele relatorio documenta duas vezes, cometido dentro dele. O paragrafo ficou
marcado porque apagar apagaria a evidencia de que o padrao sobrevive ao registro do
padrao.

**E a licao que nao produziu mudanca nenhuma, que foi a melhor do dia.** O diario
de 10/09 nao tem `atualizado_em` e acabara de receber 28 linhas de adendo. Meu
impulso foi acrescentar o campo, como eu mesmo fizera com `criado_em` naquele
arquivo no dia anterior. Medi primeiro: **o portao aprova sem o campo.** A correcao
seria preferencia minha disfarcada de requisito, dentro de registro alheio.
Corrigir sem medir e pior que concluir sem medir, porque deixa rastro de autoridade
num documento que nao e seu.
