# PRD: Pipeline de Ingestão (Receptor Web)

**Autor:** CHICO (atuando como @planner) | **Data:** 2026-03-16 | **Status:** Aprovado para Auditoria

---

## 1. Problema

O Protocolo Handoff (`.\do.ps1 -Web`) resolveu a ida do contexto para os modelos Premium (Claude Pro / Gemini Advanced) na interface Web. No entanto, a _volta_ (trazer o código gerado da Web para o ambiente local) ainda depende de copy-paste arquivo por arquivo. Isso gera fadiga, aumenta a chance de erro humano e quebra o estado de "fluxo" do usuário.

## 2. Resultado Esperado (Visão)

O "Loop de Fricção Zero". O usuário clica no botão "Copy" da resposta inteira do LLM na Web, volta ao terminal, digita `.\do.ps1 -Ingest` e o sistema:

1. Lê o clipboard instantaneamente.
2. Identifica todos os blocos de código e seus caminhos absolutos/relativos.
3. Materializa os arquivos no disco.
4. Executa comandos de terminal se o LLM os tiver instruído (ex: `npm install`).
5. Emite feedback sonoro e visual (CyberBeep + Toast).

## 3. Histórias de Usuário

- **Ator:** Raphael Vitoi (CEO)
- **Gatilho:** Recebe uma arquitetura completa gerada pelo Claude Opus no chat da IDE.
- **Ação:** Copia a resposta inteira e roda `.\do.ps1 -Ingest`.
- **Resultado:** O sistema materializa 5 arquivos simultaneamente e instala dependências sem que ele precise abrir arquivo por arquivo.

## 4. Requisitos

| ID   | Requisito               | Prioridade | Notas                                                            |
| ---- | ----------------------- | ---------- | ---------------------------------------------------------------- |
| R-01 | Captura de Clipboard    | Deve       | O PS1 deve usar `Get-Clipboard` com robustez contra encodings.   |
| R-02 | Roteamento para o Motor | Deve       | O conteúdo capturado deve ser passado para o `task_executor.py`. |
| R-03 | Parseamento Nativo      | Deve       | O Python aplicará a já existente `apply_god_mode`.               |
| R-04 | Segurança Ativa         | Deve       | Comandos destrutivos já barrados no God Mode devem ser mantidos. |
| R-05 | Feedback Visual/Sonoro  | Deveria    | Confirmar a assimilação via Toast/Beep para "Didática Visceral". |

## 5. Fora do Escopo

- OCR ou ingestão de imagens. O foco é estritamente texto/markdown gerado por LLM.

## 6. Riscos & Mitigações

| Risco                       | Severidade | Mitigação                                                                                                                                     |
| --------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Corrupção de Encoding UTF-8 | Alta       | Salvar o clipboard em um arquivo temporário (`dropzone.md`) usando UTF-8 sem BOM antes de chamar o Python. O Python lê como UTF-8 e processa. |
| Ingestão Acidental de Lixo  | Média      | O Regex do `apply_god_mode` exige um formato estrito (`Arquivo: path \n ```...`). Lixo no clipboard será ignorado silenciosamente.            |
