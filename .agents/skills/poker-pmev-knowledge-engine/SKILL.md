---
name: poker-pmev-knowledge-engine
description: Official Gold-Standard Multimodal Knowledge, Curation, and Research Engine for Poker and PMev. Orchestrates Google Drive API v3 (ADC), local OneDrive, and workspace filetrees to search, download, read, modify, and analyze documents (PDF, DOCX, PPTX, Google Docs/Sheets), video masterclasses, and solver files (.hrcz, .cfr, .rng) for zero-latency optimal retrieval.
license: Apache-2.0
metadata:
  version: v1.0.0
  publisher: raphavitoi
---

# Poker & PMev Multimodal Knowledge Engine (`poker-pmev-knowledge-engine`)

> **Padrão-Ouro de Pesquisa, Extração, Leitura Universal e Curadoria Contínua de Poker & PMev**  
> Unifica Google Drive (API v3 via ADC), Microsoft OneDrive e Repositório Local sob governança Chico SOTA v8.0 GOLD.

---

## 1. Visão Geral & Topologia Omnichannel

A skill `poker-pmev-knowledge-engine` fornece automação completa e de latência mínima para os seis verbos operacionais:
1. **Pesquisar:** Varredura em tempo real no Google Drive (API v3) e OneDrive local (15.700+ itens).
2. **Baixar / Sincronizar:** Exportação textual de Google Docs, extração de Sheets e download de binários.
3. **Adicionar / Indexar:** Ingestão estruturada para `docs/research/pmev/` com banco SQLite local e cache hash SHA-256.
4. **Ler:** Leitura universal multi-formato (`.docx`, `.pdf`, `.pptx`, `.xlsx`, `.md`, `.txt`, `.hrcz`, `.cfr`).
5. **Modificar / Sintetizar:** Curadoria, geração de relatórios canônicos, cross-references e reconciliação de hipóteses PMev ($H_1$ a $H_{12}$).
6. **Assistir / Multimídia:** Mapeamento de aulas gravadas (Akkari Team, Bencb, Ole Schemion, Lipe PIV, CNC), extração de áudio e telemetria de transcrições.

```mermaid
flowchart TD
    classDef main fill:#1e293b,stroke:#38bdf8,stroke-width:2px,color:#fff;
    classDef source fill:#0f172a,stroke:#64748b,stroke-width:1px,color:#e2e8f0;
    classDef engine fill:#0284c7,stroke:#38bdf8,stroke-width:2px,color:#fff;
    classDef output fill:#10b981,stroke:#34d399,stroke-width:2px,color:#fff;

    subgraph Fontes Omnichannel
        GD["Google Drive API v3<br/>(OAuth / ADC)"] :::source
        OD["OneDrive Local<br/>(C:\\Users\\rapha\\OneDrive)"] :::source
        WS["Workspace Site<br/>(docs/research/pmev)"] :::source
    end

    subgraph Motor de Execução
        SE["scripts/drive_search.mjs<br/>Busca Rápida Drive"] :::engine
        FE["scripts/drive_fetch.mjs<br/>Download & Export"] :::engine
        UR["scripts/universal_reader.py<br/>Leitor PDF / DOCX / PPTX"] :::engine
        CI["scripts/curate_index.py<br/>Indexador & Cache SQLite"] :::engine
    end

    subgraph Consumo & Síntese
        DB[("Cache SQLite & Índices<br/>pmev_knowledge.db")] :::main
        MD["Artefatos & Relatórios<br/>Markdown SOTA & KaTeX"] :::output
    end

    GD --> SE --> FE --> CI
    OD --> UR --> CI
    WS --> UR --> CI
    CI --> DB --> MD
```

---

## 2. Instruções de Execução Rápida

### 2.1 Pesquisa Instantânea no Google Drive
Para buscar qualquer tópico ou arquivo no Google Drive via token ADC silencioso:
```bash
node scripts/drive_search.mjs "termo de busca" [maxResults]
```

### 2.2 Download e Exportação de Arquivos do Drive
Para exportar Docs para texto limpo, baixar PDFs ou DOCX para o diretório local:
```bash
node scripts/drive_fetch.mjs <FILE_ID> [CAMINHO_DESTINO]
```

### 2.3 Leitura Universal de Arquivos Locais (PDF, DOCX, PPTX, XLSX)
Para inspecionar e extrair texto completo ou sumários de qualquer arquivo local (incluindo OneDrive hidratado):
```bash
.venv/Scripts/python.exe scripts/universal_reader.py "C:\caminho\do\arquivo.ext" [--max-chars N]
```

### 2.4 Atualização do Índice e Cache SQLite
Para indexar todos os arquivos baixados e do OneDrive em um banco de consulta ultra-rápido (<10ms):
```bash
.venv/Scripts/python.exe scripts/curate_index.py --build
```

---

## 3. Matriz de Formatos e Extratores Nativos

| Extensão | Ferramenta / Biblioteca | Modo de Leitura |
| :--- | :--- | :--- |
| **Google Doc** | Google Drive API `/export?mimeType=text/plain` | Texto limpo puro sem markup pesado |
| **Google Sheet** | Google Drive API `/export?mimeType=text/csv` ou Sheets API | Matriz CSV ou ranges de células |
| **.pdf** | `pypdf.PdfReader` (Python 3.12+) | Extração página a página e contagem de tokens |
| **.docx** | `python-docx` (`docx.Document`) | Parágrafos e tabelas estruturadas |
| **.pptx** | `zipfile` + `xml.etree.ElementTree` | Varredura de slides XML e caixas de texto |
| **.xlsx / .ods**| `openpyxl` / `csv` | Abas, colunas, frequências de ranges |
| **.hrcz / .cfr** | Leitor de cabeçalho binário | Stacks efetivos, árvore pré-flop, tamanho da simulação |
| **.mp4 / .m4a** | `ffmpeg` / Metadados nativos | Duração, resolução, extração de canal de áudio |

---

## 4. Diretrizes de Governança Chico SOTA v8.0 GOLD

1. **Target Lock & Limited Scope:** O motor de pesquisa opera de forma não-destrutiva. Downloads e exports residem estritamente em `docs/research/pmev/` e `scratch/`.
2. **Cache-First:** Antes de fazer chamadas repetidas à API do Drive, consultar `pmev_knowledge.db` ou os arquivos já sincronizados em `docs/research/pmev/enciclopedia/`.
3. **Escaping KaTeX:** Todas as formulações de valor monetário devem escapar o cifrão como `\$` para garantir renderização perfeita no visual engine.
4. **Relatórios Conformes:** Qualquer nova adição ao acervo deve ser documentada com ID unívoco do arquivo, data, hash SHA-256 e referência cruzada às hipóteses $H_1$ a $H_{12}$.
