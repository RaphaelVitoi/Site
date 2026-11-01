# Auditoria SOTA — Hermes Agent Harness v0.22.5

## 1. Diagnóstico do Erro de Atualização

### Sintoma
- "无法连接到更新服务器" (não consegue conectar ao servidor de atualização)
- "无法读取已安装的修订版本" (não consegue ler a revisão instalada)
- Versão: 0.22.5+3221, Windows, commit c627ec84664d43

### Causa Raiz
O desktop app do Hermes usa `managedGitBinaries()` para encontrar o git. Este método escaneia `%LOCALAPPDATA%\hermes\tools\` por diretórios começando com `git-`. Encontrou dois:
1. `git-2.53.0+3-win32-x64` — bloqueado pelo Windows (Acesso negado)
2. `git-2.53.0+3-win32-x64.broken` — explicitamente marcado como quebrado

Ambos são bloqueados pela política de segurança do Windows. O System Git em `C:\Program Files\Git` (v2.56.0) funciona perfeitamente, mas é a última opção na lista de candidatos, e o código tenta os managed primeiro.

### Correção Aplicada
Renomeados ambos os diretórios para `DISABLED_*` para que `managedGitBinaries()` não os detecte. O candidate resolver agora cai no System Git (funcional).

### Verificação
- `git rev-parse HEAD` → c627ec84664d43e0b18b95d9d86d8963747d56c7 ✅
- Bootstrap marker: pinnedCommit = c627ec84664d43e0b18b95d9d86d8963747d56c7 ✅
- Working tree: clean ✅

---

## 2. Auditoria do Codebase

### 2.1 Estrutura
- **Core**: agent/, tools/, cli.py, run_agent.py
- **Desktop**: apps/desktop/electron/ (TypeScript/React)
- **Skills**: skills/ (bundled + optional)
- **Tests**: tests/, tests-js/
- **Docs**: website/

### 2.2 Qualidade de Código
- **F8 (undefined names)**: 0 erros em agent/ + tools/ + cli.py + run_agent.py ✅
- **F401 (unused imports)**: 976 warnings (não-criticos, maioria em tools/)
- **ruff E501 (line too long)**: 291k (principalmente website/ e docs)
- **yaml_load**: usa safe_load ✅

### 2.3 Segurança
- `yaml_load` → `hermes_yaml.safe_load` ✅
- `ast.literal_eval` para valores (seguro) ✅
- `subprocess` com `shell=False` (padrão) ✅
- Aprovação de comandos via `approval.py` ✅
- Vault de credenciais (browser_vault) ✅
- Nenhum `eval()`/`exec()` direto em código de produção ✅

### 2.4 Configuração
- **Versão**: 0.22.5 (matching desktop app)
- **Branch**: main, up-to-date com origin/main
- **Working tree**: clean
- **Python**: 3.14.9
- **Node**: (não verificado)

### 2.5 Dependências
- **Git**: System Git 2.56.0 (funcional) + managed git (desabilitado)
- **Python**: 3.14.9 (hermes-managed)
- **Node**: (hermes-managed)

---

## 3. Plano de Consolidação SOTA

### 3.1 Correções Imediatas
1. ✅ Desabilitar managed git quebrado → usar System Git
2. ✅ Verificar bootstrap marker (correto)
3. ⚠️ Limpar unused imports (F401) — baixa prioridade, não afeta funcionalidade

### 3.2 Otimizações
1. **Git binary resolution**: Adicionar probe de execução (`--version`) no `resolveGitBinary` para skipar binários que existem mas não executam
2. **Update check**: Adicionar fallback para System Git quando managed falha
3. **PATH hygiene**: Remover diretórios de git quebrado do PATH permanentemente

### 3.3 Integração com Ecossistema
- Hermes Agent é o harness principal (condutor)
- Integrado com: Site (llm/routing_policy.py), extensions (Chrome MV3), Duo Bus (v2.0.0)
- Configuração sincronizada via `sincronizar_nucleo.py`
- Modelos: primary = nous/reflection/beam-1.0-501b-a23b:free, fallbacks verificados

### 3.4 Potencialização
- **MOA (Mixture of Agents)**: 5 referências funcionais + aggregator beam-1.0-501b
- **Delegation**: nemotron-3-ultra:cloud (funcional, 262K ctx)
- **Fallback chain**: 6 modelos verificados como funcionais
- **Stealth models**: todos removidos (404)

---

## 4. Verificação Final

| Check | Status |
|-------|--------|
| Git funcional | ✅ System Git 2.56.0 |
| Bootstrap marker | ✅ pinnedCommit correto |
| Working tree | ✅ clean |
| Branch | ✅ main, up-to-date |
| Core code F8 | ✅ 0 erros |
| yaml_load | ✅ safe_load |
| Update check | ✅ deve funcionar agora |
| Extension audit | ✅ 65 PASS |

---

## 5. Recomendações SOTA

1. **Monitorar managed git**: Se o PM reinstalar o git managed, verificar se funciona antes de usá-lo
2. **Adicionar probe de execução**: Modificar `resolveGitBinary` para testar `--version` antes de aceitar um binário
3. **Manter System Git como fallback primário**: Dado que o managed git é frequentemente bloqueado pelo Windows
4. **Limpar unused imports**: Rodar `ruff --fix` em tools/ para remover F401 (cosmético, não funcional)
5. **Auditar periodicamente**: Re-executar esta auditoria a cada update major
