'use client';

import { useCallback } from 'react';

export function useFrictionlessWeb () {
    const share = useCallback( async ( data: ShareData ): Promise<boolean> => {
        if ( typeof navigator === 'undefined' || !navigator.share || !navigator.canShare?.( data ) )
        {
            return false; // Ambiente não suporta Web Share API
        }

        try
        {
            await navigator.share( data );
            return true;
        } catch ( error: any )
        {
            // SOTA: Fricção Zero absoluta. Rejeições do usuário são silenciosas.
            if ( error.name === 'AbortError' )
            {
                return false;
            }
            console.error( '[CORTEX SHIELD] Falha na Web Share API:', error );
            return false;
        }
    }, [] );

    const copyToClipboard = useCallback( async ( text: string ): Promise<boolean> => {
        if ( typeof navigator === 'undefined' || !navigator.clipboard )
        {
            console.warn( '[CORTEX SHIELD] Clipboard API indisponível no contexto atual.' );
            return false;
        }

        try
        {
            await navigator.clipboard.writeText( text );
            return true;
        } catch ( error: any )
        {
            // SOTA: Fricção Zero absoluta. Permissões negadas não quebram o Event Loop.
            if ( error.name === 'NotAllowedError' )
            {
                console.warn( '[CORTEX SHIELD] Permissão negada pelo usuário para o Clipboard.' );
                return false;
            }
            console.error( '[CORTEX SHIELD] Falha ao escrever no Clipboard:', error );
            return false;
        }
    }, [] );

    return { share, copyToClipboard };
}
