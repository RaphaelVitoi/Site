## CHANGELOG DE AUDITORIA

**Auditado por @auditor** | **Data: 2026-03-12**

| # | Severidade | Localizacao | Problema Encontrado | Correcao Aplicada |
|---|-----------|-------------|--------------------|--------------------|
| 1 | ALTO | Segurança | "Sanitização" muito vaga | Especificado uso de Regex Whitelist para evitar injection via Read-Host |

**Status:** APROVADO PARA IMPLEMENTAÇÃO

---

# SPEC: Planejar e especificar a 'CLI Inteligente' (Smart do.ps1) baseada no conceito do Maverick

> Especificação Técnica

## Ordem de Implementação

1. **Setup**: Criar estrutura de dicionário de regex para mapeamento de intents.
2. **Core**: Refatorar `do.ps1` para aceitar input interativo `Read-Host` se nenhum argumento for passado.
3. **Lógica**: Implementar função `Resolve-Intent` que pontua keywords contra agentes.
4. **UI**: Implementar prompt de confirmação "Você quis dizer...? [S/N]".

## Checklist de Segurança

- [ ] Sanitização de input no `Read-Host` (Usar regex `^[a-zA-Z0-9\-\_\s]+$` para whitelist).
- [ ] Timeout em espera de resposta do usuário.
