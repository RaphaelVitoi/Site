import init, { calculate_equity_monte_carlo } from '../../../../wasm-equity/pkg/vitoi_equity_engine.js';

let initialized = false;

const RANKS = "23456789TJQKA";

function _generatePairs ( c: string, suits: string[] ): string[] {
    const combos = [];
    for ( let i = 0; i < 4; i++ )
    {
        for ( let j = i + 1; j < 4; j++ ) combos.push( `${c}${suits[ i ]}${c}${suits[ j ]}` );
    }
    return combos;
}

function _generateUnpaired ( c1: string, c2: string, isSuited: boolean, isOffsuit: boolean, suits: string[] ): string[] {
    const combos = [];
    for ( let i = 0; i < 4; i++ )
    {
        for ( let j = 0; j < 4; j++ )
        {
            if ( isSuited && i !== j ) continue;
            if ( isOffsuit && i === j ) continue;
            combos.push( `${c1}${suits[ i ]}${c2}${suits[ j ]}` );
        }
    }
    return combos;
}

function _expandPlus ( r: string ): string[] {
    if ( !r.endsWith( '+' ) ) return [ r ];
    const base = r.slice( 0, -1 );

    // Pares (Ex: 88+ -> 88, 99, TT, JJ, QQ, KK, AA)
    if ( base.length === 2 && base.startsWith( base[ 1 ] ) )
    {
        const startIdx = RANKS.indexOf( base[ 0 ] );
        const combos = [];
        for ( let i = startIdx; i < RANKS.length; i++ ) combos.push( `${RANKS[ i ]}${RANKS[ i ]}` );
        return combos;
    }

    // Desemparelhadas (Ex: ATo+ -> ATo, AJo, AQo, AKo)
    if ( base.length >= 2 )
    {
        const c1 = base[ 0 ], c2 = base[ 1 ];
        const suffix = base.substring( 2 ); // 's', 'o', ou ''
        const i1 = RANKS.indexOf( c1 ), i2 = RANKS.indexOf( c2 );
        if ( i1 === -1 || i2 === -1 ) return [ base ];

        const high = Math.max( i1, i2 );
        const low = Math.min( i1, i2 );
        const combos = [];

        for ( let i = low; i < high; i++ ) combos.push( `${RANKS[ high ]}${RANKS[ i ]}${suffix}` );
        return combos;
    }
    return [ base ];
}

function _expandSingleRange ( r: string ): string {
    const parts = r.split( ':' );
    const base = parts[ 0 ];
    const weight = parts[ 1 ] || '1.0';

    if ( base.length === 4 && !base.includes( '+' ) ) return `${base}:${weight}`; // Exato (Ex: AhKh)

    // SOTA: Descompactação Termodinâmica do espectro "+"
    const expandedPlus = _expandPlus( base );
    if ( expandedPlus.length > 1 )
    {
        return expandedPlus.map( sub => _expandSingleRange( `${sub}:${weight}` ) ).join( ',' );
    }

    const baseR = expandedPlus[ 0 ];
    const suits = [ 'h', 'd', 'c', 's' ];
    if ( baseR.length >= 2 && baseR.length <= 3 && !baseR.endsWith( '%' ) )
    {
        const c1 = baseR[ 0 ]; const c2 = baseR[ 1 ];
        const combos = c1 === c2
            ? _generatePairs( c1, suits )
            : _generateUnpaired( c1, c2, baseR.endsWith( 's' ), baseR.endsWith( 'o' ), suits );

        return combos.map( c => `${c}:${weight}` ).join( ',' );
    }
    return `${baseR}:${weight}`; // Fallback
}

// SOTA: Expansor de Range Termodinâmico (Fase 2)
// Traduz notações rápidas ("AKs", "QQ") para matrizes combinatórias brutas que o Rust consome sem esforço.
function expandPokerRange ( rangeStr: string ): string {
    if ( rangeStr.includes( ',' ) ) return rangeStr.split( ',' ).map( s => expandPokerRange( s ) ).join( ',' );
    return _expandSingleRange( rangeStr.trim() );
}
// SOTA: A instância do Web Worker atua como ponte de Fricção Zero para o motor combinatório em Rust.
globalThis.onmessage = async ( e: MessageEvent ) => {
    const { heroRange, villainRange, board } = e.data;

    try
    {
        if ( !initialized )
        {
            // Instanciação Lazy SOTA (não trava o startup do worker)
            // SOTA: Cache Buster Termodinâmico.
            // Força o navegador a destruir o cache antigo e buscar o binário re-forjado.
            await init( { module_or_path: `/wasm/vitoi_equity_engine_bg.wasm?v=${Date.now()}` } );
            initialized = true;
        }

        const cleanHero = expandPokerRange( heroRange ).replaceAll( /\s+/g, "" );
        const cleanVillain = expandPokerRange( villainRange ).replaceAll( /\s+/g, "" );
        const cleanBoard = ( board || "" ).replaceAll( /\s+/g, "" );

        // SOTA: 10.000 iterações garantem significância estatística profunda com latência sub-50ms na CPU cliente isolada.
        const iterations = 10000;
        const seed = Math.floor( Math.random() * 4294967296 ); // SOTA: Injeção de Semente Absoluta (Resolve o pânico de entropia)

        const equity = calculate_equity_monte_carlo( cleanHero, cleanVillain, cleanBoard, iterations, seed );

        // Honestidade Intelectual: Interceptando os contratos de entropia do Rust
        if ( equity === -1 ) throw new Error( "Sintaxe inválida: Hero (Ex: AhKh, AKs, QQ)." );
        if ( equity === -2 ) throw new Error( "Sintaxe inválida: Vilão (Ex: QdQc, AJo)." );
        if ( equity === -3 ) throw new Error( "Sintaxe inválida: Board (Use até 5 cartas exatas ou deixe em branco)." );
        if ( equity === -4 ) throw new Error( "Anomalia Quântica: Cartas duplicadas (colisão) detectadas na entrada." );
        if ( equity < 0 ) throw new Error( "Falha matemática no motor WASM." );

        globalThis.postMessage( { equity: Math.round( equity * 100 ) } );
    } catch ( error: any )
    {
        // SOTA: Bypass de Error Overlay do Next.js dentro do Worker
        console.warn( "[SOTA Worker] Falha silenciada na inferência WASM:", error.message || String( error ) );
        globalThis.postMessage( { error: error.message || String( error ) } ); // SOTA: Não sobrescreve a equidade em caso de falha matemática
    }
};
