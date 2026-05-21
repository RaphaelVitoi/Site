'use client';

import { motion } from 'framer-motion';
import React, { useState } from 'react';

export interface ExportAntevisaoProps {
    bf: number;
    rp: number;
    pureEv: number;
    icmEv: number;
    pot: number;
    bet: number;
}

const ExportAntevisaoButton: React.FC<ExportAntevisaoProps> = ( props ) => {
    const [ status, setStatus ] = useState<'idle' | 'loading' | 'success' | 'error'>( 'idle' );

    const statusTextMap = {
        idle: 'Exportar O.G.',
        loading: 'Forjando...',
        success: 'Materializado',
        error: 'Falha na Matriz'
    };

    const handleExport = async () => {
        try
        {
            setStatus( 'loading' );

            // SOTA: Sanitização Estrita de Tipos e Proteção contra Entropia JS (NaN/Infinity)
            const sanitizeNum = ( val: number, decimals: number = 2, fallback: number = 0 ): string => {
                if ( typeof val !== 'number' || Number.isNaN( val ) || !Number.isFinite( val ) )
                {
                    return fallback.toFixed( decimals );
                }
                return val.toFixed( decimals );
            };

            // Serialização rigorosa para a matriz OG
            const params = new URLSearchParams( {
                bf: sanitizeNum( props.bf, 3, 1 ),      // Bubble Factor base (fallback) é 1.000
                rp: sanitizeNum( props.rp, 1, 0 ),
                pureEv: sanitizeNum( props.pureEv, 2, 0 ),
                icmEv: sanitizeNum( props.icmEv, 2, 0 ),
                pot: sanitizeNum( props.pot, 1, 0 ),
                bet: sanitizeNum( props.bet, 1, 0 ),
            } );

            const url = `/api/og/icm-chart?${params.toString()}`;
            const response = await fetch( url );

            if ( !response.ok )
            {
                const errorPayload = await response.text().catch( () => 'Payload de erro inacessível' );
                throw new Error( `Falha na matriz Vercel OG (HTTP ${response.status}): ${errorPayload}` );
            }

            const blob = await response.blob();
            const fileName = `perspectiva-vitoi-${Date.now()}.png`;

            // Antevisão: Web Share API oferece UX infinitamente superior no Mobile e Edge/Safari Desktop.
            const shareData = {
                title: 'Perspectiva Matemática SOTA',
                text: 'Análise de Risco e ICM Ev vs Chip EV pelo Motor MasterSimulator.',
                files: [ new File( [ blob ], fileName, { type: blob.type } ) ],
            };

            if ( navigator.share && navigator.canShare?.( shareData ) )
            {
                await navigator.share( shareData );
            } else
            {
                // Fallback Clássico: Download Assíncrono via URL Object
                const objectUrl = URL.createObjectURL( blob );
                const a = document.createElement( 'a' );
                a.href = objectUrl;
                a.download = fileName;
                document.body.appendChild( a );
                a.click();
                a.remove();
                URL.revokeObjectURL( objectUrl );
            }

            setStatus( 'success' );
            setTimeout( () => setStatus( 'idle' ), 3000 );
        } catch ( error: any )
        {
            // SOTA: Fricção Zero. Se o usuário apenas fechou a janela de share, ignoramos silenciosamente.
            if ( error.name === 'AbortError' )
            {
                setStatus( 'idle' );
                return;
            }
            console.error( '[CORTEX SHIELD] Falha na exportação OG:', error );
            setStatus( 'error' );
            setTimeout( () => setStatus( 'idle' ), 4000 );
        }
    };

    let statusClasses = 'border-gray-700 text-gray-300 bg-gray-900/60 hover:bg-gray-800 hover:text-white hover:border-gray-500';
    if ( status === 'success' )
    {
        statusClasses = 'border-green-500/50 text-green-400 bg-green-900/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]';
    } else if ( status === 'error' )
    {
        statusClasses = 'border-[#cd5c5c]/50 text-[#cd5c5c] bg-[#cd5c5c]/20 shadow-[0_0_15px_rgba(205,92,92,0.2)]';
    }

    return (
        <motion.button
            onClick={ handleExport }
            disabled={ status === 'loading' }
            whileHover={ { scale: 1.02 } }
            whileTap={ { scale: 0.98 } }
            className={ `px-5 py-2.5 flex items-center justify-center gap-2 rounded-lg font-mono text-sm tracking-wide transition-all shadow-lg backdrop-blur-sm border ${statusClasses}` }
        >
            { status === 'idle' && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 1.5 } d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            ) }
            { status === 'loading' && (
                <svg className="w-4 h-4 animate-spin text-[#cd5c5c]" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75" /></svg>
            ) }
            { status === 'success' && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 1.5 } d="M5 13l4 4L19 7" /></svg>
            ) }
            { status === 'error' && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 1.5 } d="M6 18L18 6M6 6l12 12" /></svg>
            ) }

            { statusTextMap[ status ] }
        </motion.button>
    );
};

export default ExportAntevisaoButton;
