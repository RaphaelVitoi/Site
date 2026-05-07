/**
 * IDENTITY: HRC Export Utility
 * PATH: src/lib/hrcExport.ts
 * ROLE: Converter cenários de equidade interna para o formato JSON compatível com o Holdem Resources Calculator (HRC).
 * BINDING: [src/components/simulator/panels/EquityCalculator.tsx]
 * TELEOLOGY: Permitir que o usuário exporte spots complexos para análise profunda no solver HRC, mantendo a interoperabilidade SOTA.
 */

import { ICMPlayer } from './icmEngine';

export interface HRCConfig {
  version: string;
  description: string;
  equityModel: {
    type: string;
    prizes: number[];
    totalChips: number;
  };
  structure: {
    sb: number;
    bb: number;
    ante: number;
    anteType: string;
  };
  players: {
    name: string;
    stack: number;
    bounty: number;
  }[];
  treeConfig: {
    mode: string;
    preflop: {
      raiseSizes: string;
      allowFlatting: boolean;
      maxActivePlayers: number;
    };
  };
}

/**
 * Converte o estado da calculadora para o formato JSON do HRC.
 *
 * @param players Lista de jogadores e seus stacks (em BB).
 * @param prizes Lista de prêmios (em %).
 * @param pkoWeight Peso do bounty (0-1).
 * @returns String JSON formatada para HRC.
 */
export function generateHRCJson (
  players: ICMPlayer[],
  prizes: number[],
  pkoWeight: number = 0
): string {
  const totalChips = players.reduce( ( sum, p ) => sum + p.stack, 0 );

  // Como os stacks no sistema Vitoi são geralmente em BB,
  // normalizamos para BB=100 para compatibilidade universal no HRC.
  const bbValue = 100;
  const sbValue = 50;

  const hrcConfig: HRCConfig = {
    version: "3.0",
    description: `Exported from Vitoi SOTA - ${players.length} Players`,
    equityModel: {
      type: pkoWeight > 0 ? "FGS" : "ICM", // FGS é preferível em HRC para PKO/MTT complexos
      prizes: prizes,
      totalChips: totalChips * bbValue
    },
    structure: {
      sb: sbValue,
      bb: bbValue,
      ante: 0,
      anteType: "ANTE_ALL"
    },
    players: players.map( p => ( {
      name: p.name,
      stack: p.stack * bbValue,
      bounty: pkoWeight // No HRC v3, bounty pode ser um valor absoluto ou multiplicador dependendo do setup
    } ) ),
    treeConfig: {
      mode: "MONTE_CARLO",
      preflop: {
        raiseSizes: "2.2bb",
        allowFlatting: true,
        maxActivePlayers: 3
      }
    }
  };

  return JSON.stringify( hrcConfig, null, 2 );
}

/**
 * Aciona o download do arquivo JSON no navegador.
 */
export function downloadHRCJson ( json: string, filename: string = 'vitoi_scenario_hrc.json' ) {
  // SOTA: Check de SSR nativo para evitar explosão de APIs do DOM no Next.js Server
  if ( globalThis.window === undefined || globalThis.document === undefined ) return;

  const blob = new Blob( [ json ], { type: 'application/json;charset=utf-8' } );
  const url = URL.createObjectURL( blob );
  const link = document.createElement( 'a' );
  link.href = url;
  link.download = filename;
  document.body.appendChild( link );
  link.click();
  link.remove();

  // SOTA: Prevenção de revogação prematura que cancela o download no Safari/iOS
  setTimeout( () => URL.revokeObjectURL( url ), 1000 );
}
