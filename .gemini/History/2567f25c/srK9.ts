/**
 * Validacao: 9p FT stacks reconstruidos das descricoes da Geometria do Risco
 * Objetivo: derivar RP automaticamente e comparar com HRC manual
 * Executar: npx tsx src/lib/_validate_rp.ts
 */
import { deriveRps } from './rpDeriver';

const FT9 = [ 237.34, 170.96, 135.17, 109.99, 90.28, 73.95, 59.92, 47.56, 36.47 ];

// Reconstrucao baseada em geometria_texto.md + contexto FT 9p
// IP = index 0, OOP = index 1
const cases = [
  {
    id: 'paradoxo',
    desc: 'BTN(40) vs BB(54,CL). Outros: mid+shorts variados',
    // BB e CL (54), BTN segunda maior (40). Resto disperso abaixo.
    stacks: [ 40, 54, 30, 25, 20, 15, 10, 8, 6 ],
    manualIp: 21.4, manualOop: 12.9,
  },
  {
    id: 'pacto',
    desc: 'CL(70) vs Vice(65), mesa cheia de micro-stacks 10-15',
    stacks: [ 65, 70, 15, 14, 13, 12, 11, 10, 10 ],
    manualIp: 24.5, manualOop: 23.5,
  },
  {
    id: 'batata',
    desc: 'Shover(25) sobre BB(20). Mesa com CL e mids',
    stacks: [ 25, 20, 55, 45, 35, 28, 18, 12, 8 ],
    manualIp: 15, manualOop: 19.5,
  },
  {
    id: 'agonia',
    desc: 'CL(80) ataca mid-stack(30). Shorts na mesa amplificam dor',
    stacks: [ 80, 30, 25, 20, 15, 12, 10, 8, 6 ],
    manualIp: 5, manualOop: 42,
  },
  {
    id: 'lama',
    desc: 'Dois shorts ~10-12, mesa dominada por colossos 80bb+',
    stacks: [ 12, 10, 80, 70, 55, 45, 35, 25, 18 ],
    manualIp: 8.5, manualOop: 10.5,
  },
  {
    id: 'ameaca',
    desc: 'CL absoluto(90) ataca Vice(25). CL imortal nesta mao',
    stacks: [ 90, 25, 22, 18, 15, 12, 10, 8, 6 ],
    manualIp: 12, manualOop: 38,
  },
  {
    id: 'sniper',
    desc: 'CL(50) snipa short(12). Outros shorts: 8, 9. Mesa com mids',
    stacks: [ 50, 12, 8, 9, 35, 30, 25, 20, 15 ],
    manualIp: 12, manualOop: 45,
  },
  {
    id: 'bully',
    desc: 'CL(80) oprime mid(20) e short(18). Mesa mista',
    stacks: [ 80, 20, 18, 30, 25, 22, 15, 10, 8 ],
    manualIp: 5, manualOop: 42,
  },
  {
    id: 'especulacao',
    desc: 'Mid(35) especula vs CL(80), short(12) catalisador',
    stacks: [ 35, 80, 12, 25, 20, 16, 10, 8, 6 ],
    manualIp: 38, manualOop: 8.2,
  },
];

console.log( '=== VALIDACAO RP: FT 9P RECONSTRUIDA (geometria_texto) ===\n' );
console.log(
  'Cenario'.padEnd( 14 ),
  'IP man'.padEnd( 8 ), 'IP der'.padEnd( 8 ),
  'OOP man'.padEnd( 8 ), 'OOP der'.padEnd( 8 ),
  'IP BF'.padEnd( 7 ), 'OOP BF'.padEnd( 7 ),
  'Diff'
);
console.log( '-'.repeat( 85 ) );

for ( const c of cases )
{
  const result = deriveRps( c.stacks, FT9, 0, 1 );
  if ( !result )
  {
    console.log( c.id.padEnd( 14 ), String( c.manualIp ).padEnd( 8 ), 'NULL'.padEnd( 8 ), String( c.manualOop ).padEnd( 8 ), 'NULL'.padEnd( 8 ) );
    continue;
  }
  const ipDiff = Math.abs( result.ipRp - c.manualIp );
  const oopDiff = Math.abs( result.oopRp - c.manualOop );
  const maxDiff = Math.max( ipDiff, oopDiff );

  let tag = 'DIVERGE';
  if ( maxDiff < 3 )
  {
    tag = 'EXATO';
  } else if ( maxDiff < 6 )
  {
    tag = 'OK';
  } else if ( maxDiff < 10 )
  {
    tag = 'ACEITAVEL';
  }

  console.log(
    c.id.padEnd( 14 ),
    String( c.manualIp ).padEnd( 8 ),
    result.ipRp.toFixed( 1 ).padEnd( 8 ),
    String( c.manualOop ).padEnd( 8 ),
    result.oopRp.toFixed( 1 ).padEnd( 8 ),
    result.allBfs[ 0 ].toFixed( 2 ).padEnd( 7 ),
    result.allBfs[ 1 ].toFixed( 2 ).padEnd( 7 ),
    tag
  );
}
