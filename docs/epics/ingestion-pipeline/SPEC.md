# SPEC: Pipeline de Ingestao (Receptor Web)

**Autor:** CHICO (atuando como @planner) | **Data:** 2026-03-16 | **PRD:** PRD.md

---

## 1. Resumo da Investigacao

A analise forense da infraestrutura SOTA revela que:

1. A CLI inteligente (`do.ps1`) processa parametros, mas nao possui flag para Ingestao.
2. O DAL Python (`task_executor.py`) ja detem a funcao `apply_god_mode(text: str)`, que e uma obra-prima de regex capaz de forjar arquivos fisicos e rodar comandos de sistema. Atualmente, ela so e acionada por tarefas da fila.
3. **O Plano Elegante:** Nao vamos duplicar logica de Regex no PowerShell. Faremos o PowerShell capturar a area de transferencia, despejar em um "buffer de transferencia" (um arquivo temporario isolado), e invocaremos o Python via CLI para processar esse arquivo usando o motor God Mode existente.

## 2. Mudancas no Backend (Python DAL)

**Arquivo:** `task_executor.py`

- Modificar o bloco `if __name__ == "__main__":` para aceitar um novo argumento: `ingest`.
- **Comportamento esperado:**
  - Se o comando for `python task_executor.py ingest <caminho_do_arquivo>`, o script abrira o arquivo `<caminho_do_arquivo>` com codificacao `utf-8`.
  - Lera o conteudo e chamara `apply_god_mode(conteudo)`.
  - Imprimira um resumo no `stdout` para o PowerShell capturar.
  - Excluira o arquivo temporario por asseio operacional (Autopoiese).

## 3. Mudancas na CLI (Membrana Inteligente)

**Arquivo:** `do.ps1`

- Adicionar a diretiva `[switch]$Ingest` no bloco `param()`.
- Se `$Ingest` for verdadeiro:
  1. Pular a logica de deteccao de Intencao (`Resolve-Intent`) e Handshake.
  2. Capturar o conteudo da area de transferencia: `$clipboard = Get-Clipboard -Raw`.
  3. Se vazio, abortar com CyberBeep Error.
  4. Criar um arquivo em `.claude\dropzone.md` salvando o `$clipboard` com `-Encoding UTF8`.
  5. Chamar o orquestrador Python: `python .\task_executor.py ingest ".claude\dropzone.md"`.
  6. Disparar `Invoke-CyberBeep -Type 'Success'` e notificar o usuario com estetica visual.
  7. Sair da execucao (`exit`).

## 4. Ordem de Implementacao

1. **Passo 1 (Python):** Editar `task_executor.py`.
   - Localizar a secao final onde `cmd = sys.argv[1]`.
   - Adicionar o bloco `elif cmd == "ingest":`.
   - Implementar a leitura do arquivo (`sys.argv[2]`), a chamada de `apply_god_mode(content)` e a remocao segura do arquivo via `os.remove`.
2. **Passo 2 (PowerShell):** Editar `do.ps1`.
   - Adicionar `[switch]$Ingest` nos parametros.
   - No topo da execucao (apos mostrar o header e o beep de boot), interceptar o fluxo se `$Ingest` for ativado.
   - Escrever a logica de extracao do clipboard, salvamento no `.claude/dropzone.md` e a invocacao do Python.
3. **Passo 3 (Clean Up):** Garantir que pastas como `.claude` existem antes de tentar salvar o `dropzone.md`.

## 5. Atualizacoes de Documentacao

- **Arquivo:** `GLOBAL_INSTRUCTIONS.md`
- **Secao:** `15. Economia Generalizada x Estado da Arte` -> `Protocolo de Handoff`
- **Mudancas:** Adicionar o fechamento do loop: explicar que o usuario pode utilizar `.\do.ps1 -Ingest` apos a IA gerar a resposta para aplicar automaticamente o codigo no projeto.

## 6. Checklist de Seguranca

- [x] Blindagem ASCII/UTF-8 preservada na transicao PS1 -> TXT -> Python.
- [x] Os vetos do God Mode a comandos destrutivos (como `rm -rf`) continuam ativos via Python.
- [x] O arquivo temporario `dropzone.md` deve ser apagado quer a operacao falhe ou tenha sucesso, nao deixando lixo de memoria para tras.

## 7. Casos de Teste

- [ ] Copiar um texto aleatorio para o clipboard. Rodar `.\do.ps1 -Ingest`. Nao deve quebrar nada.
- [ ] Copiar o seguinte bloco mockado:

```text
Arquivo: teste_ingest.txt
```

Ola Mundo

```

```

Rodar `.\do.ps1 -Ingest`. Verificar se `teste_ingest.txt` foi materializado corretamente.

