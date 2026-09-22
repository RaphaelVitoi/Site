# Operacao do projeto Site

Este documento e injetado no runtime de agentes. Regras de autoridade, escopo,
validacao, identidade e governanca vivem em `../CLAUDE.md` (raiz do Site) e em
`../../CLAUDE.md` (raiz multiprojeto); este arquivo nao as duplica.

## Metodo de trabalho

1. Identifique o objetivo, a fronteira responsavel e o contrato afetado.
2. Leia as fontes canonicas do dominio e localize consumidores reais.
3. Separe estado declarado, codigo, runtime e medicao.
4. Para desempenho, meca antes de otimizar; se a hipotese nao se sustenta,
   registre a medicao e nao produza patch por obrigacao.
5. Ao alterar, mantenha o diff restrito ao escopo e preserve contratos e autoria.
6. Verifique a superficie afetada pelo fluxo canonico do projeto.
7. Registre resultados com data, commit, ambiente, instrumento e limites.

## Evidencia e manutencao

- Consumidor real no fluxo (API, worker, pipeline ou UI) e verificacao
  automatizada sao necessarios para declarar uma capacidade entregue.
- Relatorio antigo nao prova estado presente. Releia status, commit e runtime
  antes de apoiar decisao em evidencias datadas.
- Incerteza e resultado: mantenha nao medido, inferido ou desconhecido rotulado.
- Tarefa aberta vai no mecanismo de registro definido em `CLAUDE.md`; nao crie
  ledger ou fonte de pendencias paralela.
- Nao promova excecao pontual a regra geral sem arbitragem explicita.
