# RELATÓRIO OFICIAL — ECOSSISTEMA COMPLETO DE EXTENSÕES (NAVEGADORES & GEMINI CLI AGENTS)
## ECOSSISTEMA SOTA v8.0 GOLD — GOVERNANÇA RAPHAEL VITOI

**Data da Reauditoria:** 2026-08-23 (01:18 Horário Local)  
**Governança Suprema (Tier 0):** Raphael Vitoi (Fundador, CEO PokerRacional, Criador do trueicm.com, AHSD/QI 136, TBP, TDAH, Hipótese PMev)  
**Auditor (Tier 1):** Chico (Super-Admin / Arquiteto do Sistema SOTA v8.0 GOLD)  
**Escopo Global:**
1. **Domínio 1 (Navegadores Web):** 4 Perfis Ativos (Google Chrome, Chrome Dev, Microsoft Edge, **Microsoft Edge Dev**) · **95 Instâncias** · 50 IDs Únicos · **824.78 MB**
2. **Domínio 2 (Gemini CLI & Antigravity):** `C:\Users\rapha\.gemini\extensions\` · **24 Extensões Agênticas** · **325.06 MB**

---

## 1. QUADRO GERAL CONSOLIDADO

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        INVENTÁRIO CONSOLIDADO MULTIDOMÍNIO                             │
├────────────────────────────┬─────────────────────────────┬─────────────────────────────┤
│ Domínio / Perfil           │ Quantidade de Extensões     │ Pegada em Disco (MB)        │
├────────────────────────────┼─────────────────────────────┼─────────────────────────────┤
│ Google Chrome (Default)    │ 28 extensões                │ 242.82 MB                   │
│ Google Chrome Dev (Default)│ 25 extensões                │ 233.78 MB                   │
│ Microsoft Edge (Default)   │ 24 extensões                │ 215.82 MB                   │
│ Microsoft Edge Dev (Default)│ 18 extensões               │ 132.36 MB                   │
├────────────────────────────┼─────────────────────────────┼─────────────────────────────┤
│ TOTAL NAVEGADORES WEB      │ 95 instâncias (50 IDs únicos)│ 824.78 MB                   │
│ GEMINI CLI AGENTS (.gemini)│ 24 extensões agênticas      │ 325.06 MB                   │
├────────────────────────────┼─────────────────────────────┼─────────────────────────────┤
│ TOTAL ECOSSISTEMA          │ 119 módulos/extensões       │ 1.15 GB                     │
└────────────────────────────┴─────────────────────────────┴─────────────────────────────┘
```

---

## 2. AUDITORIA DETALHADA: MICROSOFT EDGE DEV (`C:\Users\rapha\AppData\Local\Microsoft\Edge Dev\User Data\Default`)

O perfil **Microsoft Edge Dev** abriga 18 instâncias de extensões instaladas (17 IDs únicos) somando **132.36 MB**:

| Extensão | Versão | Tamanho | ID da Extensão | Diagnóstico & Papel |
| :--- | :---: | :---: | :--- | :--- |
| **`Malwarebytes Browser Guard`** | `3.3.3` | **67.93 MB** | `bojobppfploabceghnmlahpoonbcbacn` | Proteção contra ameaças (Sem colisão de adblock). |
| **`Superpower ChatGPT`** | `8.3.6` | **10.55 MB** | `amhmeenmapldpjdedekalnfifgnpfnkc` | Gerenciamento avançado de prompts e histórico. |
| **`TubeLens`** | `1.8.2` | **9.12 MB** | `eaaomefpilfbdjhcaigglnjmmmedenah` | Resumo de vídeos com IA e mapas mentais. |
| **`Admin Tools by Cloud Captains`**| `2026.4.28` | **7.04 MB** | `coldckiacfhnbeapgkjjpmpjgdonimfe` | Ferramentas administrativas GCP/Cloud. |
| **`Tactiq` (Versão Atual)** | `3.1.6675` | **6.71 MB** | `fggkaccpbmombhnjkjokndojfgagejfb` | Transcrição em tempo real Google Meet/Zoom/Teams. |
| **`Tactiq` (Versão Antiga Resíduo)**| `3.1.6570` | **6.71 MB** | `fggkaccpbmombhnjkjokndojfgagejfb` | *Versão anterior retida no disco pelo updater do Edge.* |
| **`Superpower for Gemini™`** | `1.5.3` | **5.93 MB** | `ahmdidjajeicoopcdpablhecokaepofl` | Pastas, exportação e prompts no Gemini Web. |
| **`ATO - AI Tab Organizer`** | `2.7.8` | **3.94 MB** | `dhljacmljbbiihhjfjcjaebajabeedfg` | Agrupador inteligente de abas com IA. |
| **`Microsoft Power Automate`** | `2.70.0.35` | **3.75 MB** | `kagpabjoboikccfdghpdlaaopmgpgfdc` | RPA e automação desktop nativa Microsoft. |
| **`'Improve YouTube!' TEST`** | `4.2081` | **3.29 MB** | `lodjfjlkodalimdjgncejhkadjhacgki` | Customizador completo de layout e player. |
| **`Promptly`** | `0.6.0` | **2.47 MB** | `jjfoaldlbbcfgkhbfmadjjelphbgmngg` | Prompt Enhancer multiplataforma. |
| **`JSON Viewer Pro`** | `1.0.7` | **1.45 MB** | `eifflpmocdbdmepbjaopkkhbfmdgijcc` | Formatador e visualizador de JSON. |
| **`Chessvision.ai Scanner`** | `3.8.3` | **1.24 MB** | `johejpedmdkeiffkdaodgoipdjodhlld` | Reconhecimento de posições de xadrez em vídeo/PDF. |
| **`Adblock para YouTube™`** | `2.9` | **0.79 MB** | `jpefmbpcbebpjpmelobfakahfdcgcmkl` | Bloqueio de anúncios no YouTube. |
| **`YouTube Quick Controls`** | `1.3.0` | **0.59 MB** | `hcbpfgoejhnhmdhkbnkeofhfmfmjfnjg` | Atalhos de reprodução. |
| **`Readwise`** | `3.2.7` | **0.52 MB** | `egfepjgjabnppmaiadpedbgadkcelcbd` | Sincronização de destaques e notas de leitura. |
| **`Audio Transcription`** | `3.2.0` | **0.31 MB** | `mgekiekmhamibkobnlfbphhifjkhkohh` | Intérprete ao vivo de áudio. |
| **`Edge relevant text changes`** | `1.2.1` | **0.02 MB** | `jmjflgjpcpepeafmmgdpfkogkghcpiha` | Componente nativo do Edge. |

> [!NOTE]
> **Achado de Otimização no Edge Dev:** A extensão `Tactiq` mantém duas pastas de versão (`3.1.6570` e `3.1.6675`) ocupando 13.42 MB somadas. A pasta da versão `3.1.6570` é órfã do ciclo de auto-update.

---

## 3. MAPA GLOBAL DE REDUNDÂNCIA (EXTENSÕES PRESENTES NOS 4 PERFIS)

As seguintes extensões estão ativas simultaneamente em **todos os 4 navegadores** (Google Chrome, Chrome Dev, Microsoft Edge e Microsoft Edge Dev):

1. **`Superpower for Gemini™`** (Folders & Prompts)
2. **`Admin Tools by Cloud Captains`** (GCP Tools)
3. **`TubeLens`** (Resumos YouTube com IA)
4. **`Readwise`** (Highlighter Sync)
5. **`JSON Viewer Pro`** (Developer Formatting)
6. **`Tactiq`** (Meeting AI Notes)
7. **`YouTube Quick Controls`** (Media Shortcuts)
8. **`Promptly`** (AI Prompt Enhancer)
9. **`'Improve YouTube!'`** (Player Tuning)

---

## 4. DOMÍNIO 2: EXTENSÕES AGÊNTICAS DO GEMINI CLI (`C:\Users\rapha\.gemini\extensions`)

Total de **24 extensões agênticas** somando **325.06 MB**:
* **Top 4 em densidade:**
  - `mcp-toolbox` (**253.55 MB**) — Barramento unificado de ferramentas Google/MCP.
  - `desktop-commander` (**54.82 MB**) — Automações de SO e terminal nativo.
  - `gemini-supermemory` (**7.30 MB**) — Base vetorial SQLite e memória contínua.
  - `nanostack` (**1.92 MB**) — Orquestrador do pipeline `/think`, `/nano`, `/review`, `/ship`.
* **20 Extensões Especializadas (~7.47 MB):** `science-superpowers`, `co-researcher`, `criticalthink`, `stitch`, `token-efficiency`, `conductor`, `todoist-extension`, `exa-mcp-server`, etc. (100% ativas e operacionais).

---

## 5. CONCLUSÃO E HOMOLOGAÇÃO

O mapeamento de extensões encontra-se agora **100% exaustivo e completo**, cobrindo a totalidade dos 4 navegadores do ambiente (Chrome, Chrome Dev, Edge e Edge Dev) além de todas as extensões do runtime agêntico.

---
*Relatório de auditoria de extensões SOTA v8.0 GOLD homologado sob governança de Raphael Vitoi.*
