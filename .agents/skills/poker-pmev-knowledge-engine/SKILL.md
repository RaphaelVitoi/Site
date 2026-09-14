---
name: poker-pmev-knowledge-engine
description: Busca, download e leitura de material de Poker e PMev (Google Drive via ADC, arquivos locais) com indice SQLite FTS5 enderecado por conteudo. Le PDF, DOCX, PPTX, XLSX, texto, saves HRC (.hrcz) e metadados de video. Escrita restrita a docs/research/pmev/ e scratch/.
license: Apache-2.0
metadata:
  version: v1.1.0
  publisher: raphavitoi
---

# Poker & PMev Knowledge Engine (`poker-pmev-knowledge-engine`)

Quatro verbos, cada um com um script. Nada aqui calibra a PMev nem valida hipótese: a
skill encontra, baixa, lê e indexa material. O que ela promete é o que os scripts fazem,
e `tests/test_skill_pmev_knowledge.py` reprova se as duas coisas divergirem.

## 1. Comandos

| Verbo | Comando |
| :--- | :--- |
| Buscar no Drive | `node scripts/drive_search.mjs "termo" [maxResults 1-100]` |
| Baixar do Drive | `node scripts/drive_fetch.mjs <FILE_ID> [DESTINO]` |
| Ler arquivo local | `.venv/Scripts/python.exe scripts/universal_reader.py <ARQUIVO> [--max-chars N]` |
| Indexar e buscar | `.venv/Scripts/python.exe scripts/curate_index.py --build` ou `--search "termo"` |

## 2. Códigos de saída

Falha nunca sai com 0. Mensagens de erro vão para o stderr, no formato `ERRO <código>: ...`.

| Código | Significado |
| ---: | :--- |
| 0 | sucesso |
| 1 | arquivo ou índice inexistente |
| 2 | extensão sem extrator |
| 3 | erro de extração (no build, ao menos um documento falhou e ficou registrado) |
| 4 | dependência ausente (`pypdf`, `python-docx`, `openpyxl`, `ffprobe`) |
| 5 | destino de escrita fora das raízes permitidas |
| 6 | uso ou configuração inválida (argumento, ADC ausente, âncoras malformadas) |
| 7 | falha remota (OAuth ou API do Drive) |

## 3. Formatos com extrator

| Extensões | Extrator | O que sai |
| :--- | :--- | :--- |
| `.pdf` | `pypdf` | texto página a página |
| `.docx` | `python-docx` | parágrafos e tabelas |
| `.pptx`, `.pptm` | `zipfile` + XML | texto por slide |
| `.xlsx`, `.xlsm` | `openpyxl` (somente leitura) | linhas por aba, separadas por tabulação |
| `.txt`, `.md`, `.json`, `.csv` | leitura UTF-8 | texto |
| `.hrcz` | `zipfile` | lista de entradas e `settings.json`; a árvore do solve não é lida |
| `.mp4`, `.m4a` | `ffprobe` | duração, formato e fluxos; áudio não é transcrito |

Google Docs e Sheets são exportados pelo `drive_fetch.mjs` como `text/plain` e `text/csv`.
`.doc`, `.ods` e `.cfr` **não** têm extrator e saem com código 2.

## 4. Cache endereçado por conteúdo

O índice (`docs/research/pmev/pmev_knowledge.db`, ignorado pelo git; outro caminho só
via `PMEV_KNOWLEDGE_DB`, e ainda dentro das raízes de escrita) guarda o SHA-256 dos bytes
de cada documento. No rebuild, conteúdo com o mesmo hash não é reextraído; conteúdo
alterado é. Documento cuja extração falhou é tentado de novo a cada build até passar.

Âncoras externas maiores que 256 MB são indexadas sem hash, por metadado declarado.

## 5. Raízes de escrita

A skill só grava em `docs/research/pmev/` e `scratch/`. Caminhos relativos resolvem a
partir da raiz do repositório, nunca do diretório atual. `drive_fetch.mjs` valida o
destino antes de qualquer chamada de rede, e `../` que escape da raiz é recusado.

## 6. Privacidade

- O repositório `Site` é público. Inventário de discos, pastas e arquivos pessoais
  **não é versionado**: vive em `local/anchors.json`, ignorado pelo git. Sem esse
  arquivo, o build indexa só o workspace.
- O ADC é lido de `%APPDATA%\gcloud\application_default_credentials.json`; nenhum valor
  dele nem o token de acesso é impresso.
- O termo de busca é escapado antes de entrar na consulta do Drive.

Formato de `local/anchors.json`: lista de objetos com `path`, `title`, `description`,
`origin` e `category`; `ext` e `size_bytes` são opcionais.
