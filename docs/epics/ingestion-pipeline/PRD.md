# PRD: Pipeline de Ingestao (Receptor Web)

**Autor:** CHICO (atuando como @planner) | **Data:** 2026-03-16 | **Status:** Aprovado para Auditoria

---

## 1. Problema

O Protocolo Handoff (`.\do.ps1 -Web`) resolveu a ida do contexto para os modelos Premium (Claude Pro / Gemini Advanced) na interface Web. No entanto, a _volta_ (trazer o codigo gerado da Web para o ambiente local) ainda depende de copy-paste arquivo por arquivo. Isso gera fadiga, aumenta a chance de erro humano e quebra o estado de "fluxo" do usuario.

## 2. Resultado Esperado (Visao)

O "Loop de Friccao Zero". O usuario clica no botao "Copy" da resposta inteira do LLM na Web, volta ao terminal, digita `.\do.ps1 -Ingest` e o sistema:

1. Le o clipboard instantaneamente.
2. Identifica todos os blocos de codigo e seus caminhos absolutos/relativos.
3. Materializa os arquivos no disco.
4. Executa comandos de terminal se o LLM os tiver instruido (ex: `npm install`).
5. Emite feedback sonoro e visual (CyberBeep + Toast).

## 3. Historias de Usuario

- **Ator:** Raphael Vitoi (CEO)
- **Gatilho:** Recebe uma arquitetura completa gerada pelo Claude Opus no chat da IDE.
- **Acao:** Copia a resposta inteira e roda `.\do.ps1 -Ingest`.
- **Resultado:** O sistema materializa 5 arquivos simultaneamente e instala dependencias sem que ele precise abrir arquivo por arquivo.

## 4. Requisitos

| ID   | Requisito               | Prioridade | Notas                                                            |
| ---- | ----------------------- | ---------- | ---------------------------------------------------------------- |
| R-01 | Captura de Clipboard    | Deve       | O PS1 deve usar `Get-Clipboard` com robustez contra encodings.   |
| R-02 | Roteamento para o Motor | Deve       | O conteudo capturado deve ser passado para o `task_executor.py`. |
| R-03 | Parseamento Nativo      | Deve       | O Python aplicara a ja existente `apply_god_mode`.               |
| R-04 | Seguranca Ativa         | Deve       | Comandos destrutivos ja barrados no God Mode devem ser mantidos. |
| R-05 | Feedback Visual/Sonoro  | Deveria    | Confirmar a assimilacao via Toast/Beep para "Didatica Visceral". |

## 5. Fora do Escopo

- OCR ou ingestao de imagens. O foco e estritamente texto/markdown gerado por LLM.

## 6. Riscos & Mitigacoes

| Risco                       | Severidade | Mitigacao                                                                                                                                     |
| --------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Corrupcao de Encoding UTF-8 | Alta       | Salvar o clipboard em um arquivo temporario (`dropzone.md`) usando UTF-8 sem BOM antes de chamar o Python. O Python le como UTF-8 e processa. |
| Ingestao Acidental de Lixo  | Media      | O Regex do `apply_god_mode` exige um formato estrito (`Arquivo: path \n ```...`). Lixo no clipboard sera ignorado silenciosamente.            |

