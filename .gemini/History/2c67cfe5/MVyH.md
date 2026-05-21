# SPEC: Pipeline de Ingestão (Receptor Web)

**Autor:** CHICO (atuando como @planner) | **Data:** 2026-03-16 | **PRD:** PRD.md

---

## 1. Resumo da Investigação

A análise forense da infraestrutura SOTA revela que:

1. A CLI inteligente (`do.ps1`) processa parâmetros, mas não possui flag para Ingestão.
2. O DAL Python (`task_executor.py`) já detém a função `apply_god_mode(text: str)`, que é uma obra-prima de regex capaz de forjar arquivos físicos e rodar comandos de sistema. Atualmente, ela só é acionada por tarefas da fila.
3. **O Plano Elegante:** Não vamos duplicar lógica de Regex no PowerShell. Faremos o PowerShell capturar a área de transferência, despejar em um "buffer de transferência" (um arquivo temporário isolado), e invocaremos o Python via CLI para processar esse arquivo usando o motor God Mode existente.

## 2. Mudanças no Backend (Python DAL)

**Arquivo:** `task_executor.py`

- Modificar o bloco `if __name__ == "__main__":` para aceitar um novo argumento: `ingest`.
- **Comportamento esperado:**
  - Se o comando for `python task_executor.py ingest <caminho_do_arquivo>`, o script abrirá o arquivo `<caminho_do_arquivo>` com codificação `utf-8`.
  - Lerá o conteúdo e chamará `apply_god_mode(conteudo)`.
  - Imprimirá um resumo no `stdout` para o PowerShell capturar.
  - Excluirá o arquivo temporário por asseio operacional (Autopoiese).

## 3. Mudanças na CLI (Membrana Inteligente)

**Arquivo:** `do.ps1`

- Adicionar a diretiva `[switch]$Ingest` no bloco `param()`.
- Se `$Ingest` for verdadeiro:
  1. Pular a lógica de detecção de Intenção (`Resolve-Intent`) e Handshake.
  2. Capturar o conteúdo da área de transferência: `$clipboard = Get-Clipboard -Raw`.
  3. Se vazio, abortar com CyberBeep Error.
  4. Criar um arquivo em `.claude\dropzone.md` salvando o `$clipboard` com `-Encoding UTF8`.
  5. Chamar o orquestrador Python: `python .\task_executor.py ingest ".claude\dropzone.md"`.
  6. Disparar `Invoke-CyberBeep -Type 'Success'` e notificar o usuário com estética visual.
  7. Sair da execução (`exit`).

## 4. Ordem de Implementação

1. **Passo 1 (Python):** Editar `task_executor.py`.
   - Localizar a seção final onde `cmd = sys.argv[1]`.
   - Adicionar o bloco `elif cmd == "ingest":`.
   - Implementar a leitura do arquivo (`sys.argv[2]`), a chamada de `apply_god_mode(content)` e a remoção segura do arquivo via `os.remove`.
2. **Passo 2 (PowerShell):** Editar `do.ps1`.
   - Adicionar `[switch]$Ingest` nos parâmetros.
   - No topo da execução (após mostrar o header e o beep de boot), interceptar o fluxo se `$Ingest` for ativado.
   - Escrever a lógica de extração do clipboard, salvamento no `.claude/dropzone.md` e a invocação do Python.
3. **Passo 3 (Clean Up):** Garantir que pastas como `.claude` existem antes de tentar salvar o `dropzone.md`.

## 5. Atualizações de Documentação

- **Arquivo:** `GLOBAL_INSTRUCTIONS.md`
- **Seção:** `15. Economia Generalizada x Estado da Arte` -> `Protocolo de Handoff`
- **Mudanças:** Adicionar o fechamento do loop: explicar que o usuário pode utilizar `.\do.ps1 -Ingest` após a IA gerar a resposta para aplicar automaticamente o código no projeto.

## 6. Checklist de Segurança

- [x] Blindagem ASCII/UTF-8 preservada na transição PS1 -> TXT -> Python.
- [x] Os vetos do God Mode a comandos destrutivos (como `rm -rf`) continuam ativos via Python.
- [x] O arquivo temporário `dropzone.md` deve ser apagado quer a operação falhe ou tenha sucesso, não deixando lixo de memória para trás.

## 7. Casos de Teste

- [ ] Copiar um texto aleatório para o clipboard. Rodar `.\do.ps1 -Ingest`. Não deve quebrar nada.
- [ ] Copiar o seguinte bloco mockado:

```text
Arquivo: teste_ingest.txt
```

Ola Mundo

```

```

Rodar `.\do.ps1 -Ingest`. Verificar se `teste_ingest.txt` foi materializado corretamente.
