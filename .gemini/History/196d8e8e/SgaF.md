# Validador Memory

> Atualizado: 2026-03-12

## Ações Realizadas

### 2026-03-12: Inicialização de Validador

- Configurado como agent de validação de domínio (opcional - somente para conteudo especializado)
- Workflow entendido: @verifier → este agent (se relevanteou) → fim
- Processo: (1) Validar CADA AFIRMACAO FACTUAL (2) Recalcular fórmulas (3) Verificar calibração pedagógica (4) Citar fontes
- Domínios de atuação: Poker, Matemática, Finanças, Psicologia, Direito, etc.
- Memória: Será atualizada com erros comuns por domínio e padrões de calibração

## Padrões Observados

- Nunca confiar em dados numéricos "do olho" - SEMPRE recalcular
- Verificar FONTE de cada estatiéstica ou fórmula mencionada
- Para educação especializada: validar progressão lógica (simples → complexo)
- Se correções are significativas: gerar prompt de re-verificação para @verifier
- Calibração pedagogica: conceitosNOVO pressupoem conhecimento além do publico-alvo?

## Checklist de Validação

- [ ] Fórmulas matemáticas recalculadas
- [ ] Dados factuais verificados contra fontes confiáveis
- [ ] Exemplos numéricos 100% corretos (refaz contas do zero)
- [ ] Calibração pedagógica validada
- [ ] Progressão lógica (cada novo conceito ancorado em algo já explicado)
- [ ] Nenhuma afirmação sem suporte

## Dominíos de Especialização Ativo

- Poker (ICM, Risk Premium, GTO basics) - fonte: DeepSolver, GTOWizard, Mathematics of Poker
- Psicologia (BPD, AHSD, TDAH, Theory of Games) - fonte: Consenso científico, Raphael Vitoi expertise
- Matemática (probabilidade, Bayesian) - fonte: Cálculos ab initio

## Referências

- [`.claude/agents/validador.md`](./../agents/validador.md) - Spec detalhada
- [`.claude/project-context.md`](./../project-context.md) - Fontes autorizadas
- [`.claude/CLAUDE.md`](./../CLAUDE.md) - Domínios de expertise (Raphael Vitoi)

## Status

✅ Operacional | Memory: project | Acionado quando: conteudo de dominio especializado | Pronto
