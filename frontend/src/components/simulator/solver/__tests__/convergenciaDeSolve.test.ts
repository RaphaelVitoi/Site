/// <reference types="jest" />

/**
 * TESTE DE CONTRATO: suficiência de convergência de um par
 * PATH: src/components/simulator/solver/__tests__/convergenciaDeSolve.test.ts
 *
 * O QUE ESTÁ EM ESTUDO, E O QUE NÃO ESTÁ:
 *
 *   O objeto é a TEORIA — o contraste entre ICMev e ChipEV no mesmo nó. Nada
 *   aqui audita solver, e o rigor de procedência é MEIO, não fim: ele existe
 *   para que o contraste observado seja atribuível ao regime, e não a diferenças
 *   de motor, de versão ou de quanto cada solve caminhou.
 *
 *   É por isso que o par é `ChipEV(HRC) × ICMev(HRC)`. Mesmo motor nos dois
 *   lados deixa o REGIME como única variável livre, que é precisamente o que o
 *   par existe para isolar. A escolha é controle experimental a serviço da
 *   demonstração teórica.
 *
 * O QUE ESTE MÓDULO ACRESCENTA:
 *
 *   `assessReproducibility` mede COMPLETUDE DE CAMPO — build lido, e-Nash lido,
 *   unidade lida — e passa **independentemente do valor** do e-Nash. Mas o valor
 *   governa quanto do contraste é sinal e quanto é resíduo de convergência.
 *
 *   O Tier 0 mediu (2026-09-04): as árvores estáticas da biblioteca do GTO
 *   Wizard vêm do HRC com **CI de 4.9**, e 4.9 é o MÍNIMO ACEITÁVEL — e basta,
 *   porque o que se apresenta é a TENDÊNCIA. Quanto menor o CI, maior a latência
 *   do solve; o teto é um ponto de equilíbrio escolhido, não uma falha tolerada.
 *
 *   Reprodutibilidade e convergência são portões DIFERENTES e ambos necessários:
 *   um responde "outra pessoa roda o mesmo solve?", o outro, "onde este par
 *   sustenta leitura?".
 *
 * Fixtures SINTÉTICAS. Nenhum valor aqui é saída real de solver.
 */

import {
  CI_MAXIMO_ACEITAVEL_HRC,
  assessConvergence,
  isRead,
  isUnreadable,
  read,
  unreadable,
} from '../evidenceContract';
import type { EvidencePair, EvidenceScenario, SolverProvenance } from '../evidenceContract';

// === FIXTURES SINTÉTICAS ===

const SOURCE = {
  documentSha256: 'a'.repeat( 64 ),
  figureIndex: 0,
  nodeLabel: 'no sintetico',
};

const CONTEXT = {
  street: 'flop' as const,
  board: read( 'Kd Jc Ts' ),
  potBb: read( 5.63 ),
  players: [
    { id: 'OOP', position: 'OOP' as const, stackBb: read( 53 ) },
    { id: 'IP', position: 'IP' as const, stackBb: read( 38 ) },
  ],
};

function provenanciaHrc( ci: number | null, unidade: 'pct' | 'bb' = 'pct' ): SolverProvenance {
  return {
    build: read( 'v2.4.1' ),
    eNash: ci === null ? unreadable( 'nao lido' ) : read( ci ),
    eNashUnit: ci === null ? unreadable( 'sem e-Nash' ) : read( unidade ),
    eNashLabel: read( 'CI' ),
  };
}

function cenario( regime: 'chipEV' | 'icmEV', provenance: SolverProvenance ): EvidenceScenario {
  return { regime, solver: 'HRC', provenance, actions: [] };
}

function par( ciChip: number | null, ciIcm: number | null, unidade: 'pct' | 'bb' = 'pct' ): EvidencePair {
  return {
    source: SOURCE,
    context: CONTEXT,
    chipEv: cenario( 'chipEV', provenanciaHrc( ciChip, unidade ) ),
    icmEv: cenario( 'icmEV', provenanciaHrc( ciIcm, unidade ) ),
  };
}

// === O TETO ===

describe( 'o teto de CI vem de medição do Tier 0, não de arredondamento', () => {
  it( 'o teto é 4.9 e está nomeado, não enterrado num literal', () => {
    expect( CI_MAXIMO_ACEITAVEL_HRC ).toBe( 4.9 );
  } );

  it( 'CI exatamente no teto é ACEITÁVEL — 4.9 é o mínimo aceitável, não o primeiro inaceitável', () => {
    expect( assessConvergence( par( 4.9, 4.9 ) ).withinThreshold ).toBe( true );
  } );

  it( 'CI acima do teto reprova, ainda que por pouco', () => {
    expect( assessConvergence( par( 4.91, 4.9 ) ).withinThreshold ).toBe( false );
  } );

  it( 'basta UM lado acima do teto para o par reprovar', () => {
    const avaliacao = assessConvergence( par( 0.3, 6.2 ) );

    expect( avaliacao.withinThreshold ).toBe( false );
    expect( avaliacao.aboveThreshold ).toEqual( [ 'icmEv' ] );
  } );

  it( 'CI baixo nos dois lados aprova', () => {
    expect( assessConvergence( par( 0.31, 0.44 ) ).withinThreshold ).toBe( true );
  } );
} );

// === O PIOR LADO ===

describe( 'o par vale o que vale seu pior lado', () => {
  it( 'o pior CI é o do lado menos convergido, não a média', () => {
    const pior = assessConvergence( par( 0.3, 4.5 ) ).worst;

    expect( isRead( pior ) ).toBe( true );
    expect( isRead( pior ) && pior.value ).toBe( 4.5 );
  } );

  it( 'média seria mentira: 0.1 com 9.7 não é um par de 4.9', () => {
    const avaliacao = assessConvergence( par( 0.1, 9.7 ) );

    expect( isRead( avaliacao.worst ) && avaliacao.worst.value ).toBe( 9.7 );
    expect( avaliacao.withinThreshold ).toBe( false );
  } );
} );

// === O QUE NÃO SE JULGA ===

describe( 'o que este portão se recusa a julgar', () => {
  it( 'e-Nash não lido não vira reprovação — é indeterminação, e ela se declara', () => {
    const avaliacao = assessConvergence( par( null, 0.4 ) );

    expect( avaliacao.withinThreshold ).toBe( false );
    expect( avaliacao.indeterminate ).toBe( true );
    expect( isUnreadable( avaliacao.worst ) ).toBe( true );
  } );

  it( 'unidade diferente de pct não se compara ao teto: 0.4 bb não é 0.4%', () => {
    const avaliacao = assessConvergence( par( 0.4, 0.4, 'bb' ) );

    expect( avaliacao.indeterminate ).toBe( true );
    expect( avaliacao.withinThreshold ).toBe( false );
  } );

  it( 'o teto é do CI do HRC e não se aplica ao MES do PioSOLVER', () => {
    const p = par( 0.4, 0.4 );
    const comMes: EvidencePair = {
      ...p,
      chipEv: {
        ...p.chipEv,
        solver: 'PioSOLVER',
        provenance: { ...provenanciaHrc( 0.4 ), eNashLabel: read( 'MES' ) },
      },
    };

    expect( assessConvergence( comMes ).indeterminate ).toBe( true );
  } );

  it( 'par sem procedência nenhuma é indeterminado, não reprovado', () => {
    const p = par( 0.4, 0.4 );
    const semProcedencia: EvidencePair = {
      ...p,
      icmEv: { ...p.icmEv, provenance: undefined },
    };

    expect( assessConvergence( semProcedencia ).indeterminate ).toBe( true );
  } );
} );

// === O QUE O TETO SERVE, E O QUE ELE NÃO PROMETE ===

/**
 * O TETO EXISTE PARA A TENDÊNCIA, NÃO PARA A PRECISÃO PONTUAL.
 *
 * O que se apresenta é a TENDÊNCIA teórica do contraste ICMev × ChipEV, e para
 * isso o patamar de 4.9 serve (Tier 0, 2026-09-04). Este portão confirma que os
 * dois lados estão nesse patamar — nada além. Ele não afirma precisão de nó
 * individual, e este contrato não a promete em lugar nenhum.
 *
 * Por isso a avaliação não carrega catálogo de ressalvas: um campo assim
 * deslocaria a leitura do que está em estudo para o que não está.
 */
describe( 'o teto qualifica a tendência, não promete precisão pontual', () => {
  it( 'um par no teto aprova, e é isso que a tendência exige', () => {
    const avaliacao = assessConvergence( par( 4.9, 4.8 ) );

    expect( avaliacao.withinThreshold ).toBe( true );
    expect( avaliacao.aboveThreshold ).toEqual( [] );
  } );

  it( 'a avaliação expõe o pior lado e nada mais — sem catálogo de ressalvas', () => {
    const avaliacao = assessConvergence( par( 0.2, 0.3 ) );

    expect( Object.keys( avaliacao ).sort() ).toEqual(
      [ 'aboveThreshold', 'indeterminate', 'withinThreshold', 'worst' ],
    );
  } );
} );
