# SecurityChief Memory

> Atualizado: 2026-03-12

## Ações Realizadas

### 2026-03-12: Inicialização de SecurityChief
- Configurado como agent de auditoria de segurança (opcional - acionado em componentes sensveis)
- Entendido: Scan de vulnerabilidades, secrets vazados, configuração insegura
- Cobertura: XSS, SQL injection, CSRF, autenticacao, pagamentos, uploads, inputs de usuario
- Memória: Será atualizada com descobertas e patterns de segurança por projeto
- Indepen dente de pipeline - pode ser rodado isoladamente antes/apos qualquer fase

## Padrões Observados

- Acionado quando projeto toca: autenticação, pagamentos, upload de arquivo, input de usuario
- Procura proativamente por: secrets hardcoded, credenciais em texto plano, endpoints inseguros
- Output: Rela tório estruturado com CRITICOS, ALTOS, MÉDIOS, BAIXOS
- CRITICOS: devem ser bloqueados antes de producão

## Checklist de Segurança

- [ ] XSS validation (inputs sanitizados?)
- [ ] SQL injection protection (parametrized queries?)
- [ ] CSRF tokens (POST/PUT/DELETE tem CSRF?)
- [ ] Authentication (credenciais nunca em código?)
- [ ] Authorization checks (usuarios só acessam seus dados?)
- [ ] File uploads (whitelist de tipos? Size limit?)
- [ ] Error handling (não expoe stack traces?)
- [ ] Logging (dados sensveis não são logados?)

## Referências

- [`.claude/agents/securitychief.md`](./../agents/securitychief.md) - Spec detalhada
- [`.claude/GLOBAL_INSTRUCTIONS.md`](./../GLOBAL_INSTRUCTIONS.md) - Princípio de segurança proativa (item §6

## Status

✅ Operacional | Memory: project | Acionado quando: componentes sensveis ou antes deploy