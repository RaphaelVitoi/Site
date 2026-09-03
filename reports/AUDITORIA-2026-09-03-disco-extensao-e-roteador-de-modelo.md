---
id: auditoria-2026-09-03-disco-extensao-e-roteador-de-modelo
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: 2026-09-03T14:35:00-03:00
atualizado_em: 2026-09-03T14:35:00-03:00
classes: [interno, medido, incidente, manutencao]
caminhos:
  - engine/gemma_server.py
  - tests/test_gemma_server_sota.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  pwsh: 7.6.5
revisoes_de_ancora:
  - registro: registro-2026-08-29-tres-orfaos
    caminhos:
      - engine/gemma_server.py
    parecer: >-
      Revisado, mantido valido, e esta sessao FECHOU uma lacuna que ele proprio
      declarou. Aquele registro anotou em nao_verificado: "nao subi o
      gemma_server para exercitar MODEL_ID em execucao; a substituicao e do
      mesmo literal pela constante de mesmo valor". Hoje o servidor foi subido na
      porta 17043, autenticado e exercitado contra o endpoint OpenAI-compativel
      -- e foi so em execucao que o defeito de normalize_model apareceu. Analise
      estatica nao o pegaria: a funcao esta sintaticamente correta e passava nos
      testes, porque o teste guardava o comportamento errado. As remocoes de
      LOCAL_MODEL_MAP e GEMINI_ALL_KEYS_WITH_POOLS que aquele registro publicou
      seguem de pe e nao foram tocadas; _MODEL_31B continua ligado. O que mudou
      foi normalize_model, funcao que aquele registro nao alterou.
verificado:
  - suite Python completa em 851 aprovados, 1 pulado e 0 reprovados, sob PowerShell
  - ruff format e ruff check limpos nos dois arquivos alterados
  - gemma_server subido na porta 17043 e exercitado com autenticacao real
  - CDP restabelecido -- porta 9222 responde Chrome/154.0.8025.0 e o proxy 9224 declara rotas [9222, 9223]
  - Ollama 0.33.2 medido, e /v1/messages responde HTTP 200 em formato Anthropic nativo
  - as 7 resolucoes de alias qwen conferidas uma a uma, antes e depois da correcao
nao_verificado:
  - quem disparou a instalacao da extensao as 03:33:08 -- o VSIXInstaller rodou, mas nao ha registro de autoria
  - quem esvaziou .claude/RELATORIOS as 14:22 -- restaurado do HEAD, causa nao determinada
  - o comportamento do roteador sob carga real de IDE, com streaming e tool calling
  - nenhuma chamada a provedor de nuvem foi feita; as chaves deste ambiente seguem revogadas
supersede: null
---

# Disco, uma extensão, e um roteador que trocava de motor sem avisar

Três achados de uma sessão que começou como limpeza de disco e terminou num
defeito de roteamento. Estão no mesmo registro porque o primeiro levou ao
segundo, e o segundo ao terceiro — a ordem não foi planejada.

## 1. O disco: 8,2 → 234,8 GB

O `C:` estava a **0,9% livre**. Não encheu gradualmente: encheu naquela
madrugada.

| Ação | Ganho |
| :--- | ---: |
| 10 modelos Ollama sem referência em `ollama_models.json` | 99,8 GB |
| Instância BlueStacks `Pie64` (a usada é a `Tiramisu64`) | 22,6 GB |
| `npm cache`, `pip`, Temp, lixeira, caches de sistema | ~26 GB |
| OneDrive marcado só-nuvem, exceto o `.hrcz` do PMev | ~50 GB |
| `Monker_HotRuns` movido para `F:\MonkerSolver\HotRuns` | 120 GB |

Nada de dado foi apagado — só cache, redundância e um emulador. Os 120 GB do
Monker e os 48,7 GB de `F:\Meu Drive` foram **movidos**, não removidos.

**Duas coisas que só não foram destruídas porque a medição veio antes.** Os dois
`.mkv` de 160,7 GB no OneDrive pareciam locais pelo meu detector de atributos;
eram placeholders — o detector do OneDrive não vale para todo cliente de nuvem, e
apliquei-o ao Google Drive também, errando de novo. E `F:\Meu Drive`, que o nome
sugeria ser cópia do Drive, contém 49,9 GB de dados **únicos** de software de
poker, sem nenhuma sobreposição com `G:\Meu Drive`.

## 2. A extensão

O que puxou ~150 GB de modelos Ollama numa madrugada:

| Hora | Evento |
| :--- | :--- |
| 03:32:18 | `VSIXINSTALLER.EXE` roda duas vezes |
| **03:33:08** | `robinbakshi.ollama-direct-custom-agent-0.9.45` aparece em `.antigravity-ide\extensions\` |
| 03:33:11 | seu `globalStorage` é criado |
| **03:33:21** | conecta ao Ollama — 13 segundos depois de instalada |
| 03:36:43 → | `POST /api/pull` em cadência de ~1/s |
| 04:31:20 | cria `C:\Users\rapha\.ollama-direct` |
| 05:14 | Ollama registra `write ... failed`: disco cheio |

**Não era malware.** `RB Ollama Agents`, extensão pública de marketplace, MIT.
Invasiva por desenho: além dos modelos, plantou dois relatórios próprios
— um `JULES_REPORT.md` e um relatorio semanal com prefixo `rb-ollama-usage-weekly`,
ambos hoje na quarentena — **dentro
do repositório git**, onde apareceram como não rastreados e teriam entrado num
commit distraído.

Desinstalada pelo Tier 0; resíduos movidos para quarentena em
`E:\SOTA_Cold_Backups\extensao-rb-ollama-2026-09-03`, com varredura posterior
confirmando zero ocorrências de `robinbakshi`, `ollama-direct` ou `rb-ollama`.

**Uma hipótese minha, errada, fica registrada.** Atribuí os pulls ao Antigravity
porque os nomes dos modelos só apareciam em transcripts dele. Eram transcripts de
**listagem de diretório**, de 29/08 — quatro dias antes. Correlação tratada como
causa, que é o que a §8.2 manda não fazer.

## 3. O roteador

O Tier 0 instalou a extensão querendo um roteador Ollama. **O projeto já tinha
um**, e melhor: `engine/gemma_server.py` expõe `POST /v1/chat/completions` com
autenticação `hmac.compare_digest`, e `llm/routing_policy.py` decide local ×
nuvem por custo. O que faltava era ele estar no ar.

Subido, o roteador revelou o defeito. `normalize_model` decidia por **substring
em cascata**, e a cascata testava `"latest"` antes de `"qwen"`:

| pedido | resolvia para | o que é |
| :--- | :--- | :--- |
| `qwen2.5-coder:0.5b` / `:1.5b` / `:7b` / `:7b-instruct-q5_K_M` | `qwen2.5-coder:3b` | o único qwen **não** instalado |
| `qwen-pmev-math:latest` | `gemma4:e4b` | **outro motor** |
| `qwen-code-surgical:latest` | `gemma4:e4b` | **outro motor** |
| `qwen-poetics:latest` | `gemma4:e4b` | **outro motor** |

Os seis qwen instalados resolviam errado. Os três perfis especializados —
todos `required: true` — eram servidos como Gemma 4 e4b, silenciosamente.

A ironia está no mesmo arquivo: `_names_local_engine` existe para impedir
exatamente isso, e documenta que servir outro modelo "**é outro motor, remoto e
pago, escolhido sem avisar**". A guarda vigiava a fronteira com a nuvem enquanto
a troca acontecia dentro do caminho local, onde ela não alcança.

**A correção** dá precedência ao nome exato: alias do manifesto, depois tag do
manifesto, e só então a heurística — que continua servindo pedidos vagos como
`"Qwen-coder"`. O manifesto é a fonte única, conforme a §3.

**Um desvio deliberado saiu junto, e foi decisão do Tier 0.** `gemma4:26b` era
redirecionado para `12b` com comentário de que era estratégico; o teste guardava
isso. Perguntado, o Tier 0 respondeu que não precisa do 26b. O desvio saiu e o
teste passou a guardar a regra nova.

## 4. O que este registro não fecha

Duas ausências, e nenhuma delas é preenchida por suposição.

**Quem instalou a extensão às 03:33.** O `VSIXInstaller` rodou; autoria não
consta em lugar nenhum que eu tenha medido.

**Quem esvaziou `.claude/RELATORIOS` às 14:22.** O arquivo foi restaurado do
`HEAD` — o git o tinha intacto, e o working tree o marcava ` D`. O
`sota_hygiene.py` tem `shutil.rmtree` por idade, mas rodou às 03:00. A
coincidência de horário com esta sessão é forte e não a descarto; simplesmente
não a comprovei.

## 5. Lição

Um teste verde não prova comportamento correto — prova que o código faz o que o
teste espera. `test_normalize_model_logic` passava há semanas guardando um
mapeamento que entregava outro modelo, e passaria para sempre se ninguém
subisse o servidor.

Foi o registro de 2026-08-29 que deixou a porta aberta, ao anotar com honestidade
que **não** havia subido o `gemma_server`. Aquela linha em `nao_verificado`
valeu mais, meses depois, que qualquer afirmação de cobertura.
