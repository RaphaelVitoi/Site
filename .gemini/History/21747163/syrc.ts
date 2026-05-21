import { calculateMapaICM } from './perspectiva';

/**
 * @file Lógica core para o cálculo do Independent Chip Model (ICM).
 * Este módulo contém a função principal para calcular os equities de jogadores em um torneio de poker
 * com base em suas pilhas de fichas e na estrutura de premiação.
 */

/**
 * Calcula os equities (valor monetário esperado) de jogadores em um torneio usando o Independent Chip Model (ICM).
 * [SOTA v3.2]: Algoritmo recursivo original (O(N!)) foi substituído por delegação ao motor
 * ultra-otimizado (O(2^N)) em `perspectiva.ts`.
 */
export function calculateICM ( stacks: number[], prizes: number[] ): { id: string; equity: number }[] {
  // Validação de inputs
  if ( !stacks || stacks.length === 0 || stacks.some( s => typeof s !== 'number' || s < 0 ) )
  {
    throw new Error( "As pilhas de fichas (stacks) devem ser um array de números positivos e não podem estar vazias." );
  }
  if ( !prizes || prizes.length === 0 || prizes.some( p => typeof p !== 'number' || p < 0 ) )
  {
    throw new Error( "Os prêmios (prizes) devem ser um array de números positivos e não podem estar vazios." );
  }

  const totalChips = stacks.reduce( ( sum, s ) => sum + s, 0 );

  // Se o total de fichas for zero (todos stacks são zero), todos têm 0 equity.
  if ( totalChips === 0 )
  {
    return stacks.map( ( _, index ) => ( { id: `Jogador ${index + 1}`, equity: 0 } ) );
  }

  // Delegação ao motor SOTA com memoização
  const mapaResult = calculateMapaICM( stacks, prizes );

  return stacks.map( ( _, index ) => ( {
    id: `Jogador ${index + 1}`,
    equity: mapaResult.equities[ index ] || 0
  } ) );
}

// --- Testes Unitarios Internos (para validacao rapida via Vitest in-source) ---
// @ts-ignore -- import.meta.vitest so existe em ambiente Vitest com defineConfig({ test: { includeSource } })
declare global {
  interface ImportMeta {
    vitest?: {
      it: any;
      expect: any;
      describe: any;
    };
  }
}

if ( import.meta.vitest )
{
  // @ts-ignore
  const { it, expect, describe } = import.meta.vitest;

  describe( 'calculateICM', () => {
    it( 'deve retornar equities iguais para stacks iguais e um prêmio', () => {
      const stacks = [ 100, 100 ];
      const prizes = [ 100 ];
      const result = calculateICM( stacks, prizes );
      expect( result.length ).toBe( 2 );
      expect( result[ 0 ].equity ).toBeCloseTo( 50 );
      expect( result[ 1 ].equity ).toBeCloseTo( 50 );
    } );

    it( 'deve retornar maior equity para stack maior com um prêmio', () => {
      const stacks = [ 200, 100 ];
      const prizes = [ 100 ];
      const result = calculateICM( stacks, prizes );
      expect( result.length ).toBe( 2 );
      expect( result[ 0 ].equity ).toBeCloseTo( 66.66666666666666 ); // (200/300) * 100
      expect( result[ 1 ].equity ).toBeCloseTo( 33.33333333333333 ); // (100/300) * 100
    } );

    it( 'deve retornar equity zero para stack zero e um prêmio', () => {
      const stacks = [ 100, 0 ];
      const prizes = [ 100 ];
      const result = calculateICM( stacks, prizes );
      expect( result.length ).toBe( 2 );
      expect( result[ 0 ].equity ).toBeCloseTo( 100 );
      expect( result[ 1 ].equity ).toBeCloseTo( 0 );
    } );

    it( 'deve retornar equities para múltiplos prêmios', () => {
      const stacks = [ 5000, 3000, 2000 ];
      const prizes = [ 100, 50 ]; // 1º lugar 100, 2º lugar 50
      const result = calculateICM( stacks, prizes );

      const expectedTotalPrize = prizes.reduce( ( sum, p ) => sum + p, 0 );
      const calculatedTotalEquity = result.reduce( ( sum, r ) => sum + r.equity, 0 );
      expect( calculatedTotalEquity ).toBeCloseTo( expectedTotalPrize );

      // Validar valores aproximados
      expect( result[ 0 ].equity ).toBeCloseTo( 67.5 );
      expect( result[ 1 ].equity ).toBeCloseTo( 49.166666666666664 );
      expect( result[ 2 ].equity ).toBeCloseTo( 33.33333333333333 );
    } );

    it( 'deve lançar erro para stacks vazias', () => {
      const stacks: number[] = [];
      const prizes = [ 100 ];
      expect( () => calculateICM( stacks, prizes ) ).toThrow( "As pilhas de fichas (stacks) devem ser um array de números positivos e não podem estar vazias." );
    } );

    it( 'deve lançar erro para prizes vazios', () => {
      const stacks = [ 100, 100 ];
      const prizes: number[] = [];
      expect( () => calculateICM( stacks, prizes ) ).toThrow( "Os prêmios (prizes) devem ser um array de números positivos e não podem estar vazios." );
    } );

    it( 'deve lançar erro para stacks com valores negativos', () => {
      const stacks = [ 100, -50 ];
      const prizes = [ 100 ];
      expect( () => calculateICM( stacks, prizes ) ).toThrow( "As pilhas de fichas (stacks) devem ser um array de números positivos e não podem estar vazias." );
    } );

    it( 'deve lançar erro para prizes com valores negativos', () => {
      const stacks = [ 100, 50 ];
      const prizes = [ 100, -20 ];
      expect( () => calculateICM( stacks, prizes ) ).toThrow( "Os prêmios (prizes) devem ser um array de números positivos e não podem estar vazios." );
    } );

    it( 'deve lidar com caso onde todos os jogadores têm stack zero', () => {
      const stacks = [ 0, 0, 0 ];
      const prizes = [ 100, 50 ];
      const result = calculateICM( stacks, prizes );
      expect( result.length ).toBe( 3 );
      expect( result[ 0 ].equity ).toBeCloseTo( 0 );
      expect( result[ 1 ].equity ).toBeCloseTo( 0 );
      expect( result[ 2 ].equity ).toBeCloseTo( 0 );
    } );

    it( 'deve lidar com caso onde um jogador tem stack zero e outros não', () => {
      const stacks = [ 1000, 500, 0 ];
      const prizes = [ 100, 50 ];
      const result = calculateICM( stacks, prizes );
      expect( result[ 0 ].equity ).toBeGreaterThan( 0 );
      expect( result[ 1 ].equity ).toBeGreaterThan( 0 );
      expect( result[ 2 ].equity ).toBeCloseTo( 0 ); // Player with 0 stack gets 0 equity
      const totalEquity = result.reduce( ( sum, r ) => sum + r.equity, 0 );
      expect( totalEquity ).toBeCloseTo( 150 ); // Total prizes
    } );
  } );
}
