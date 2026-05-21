import { useEffect, useRef, useState } from 'react';

/**
 * IDENTITY: Hook de Persistência com Fricção Zero
 * ROLE: Mantém o estado React síncrono e instantâneo, mas debouceia (300ms)
 *       o I/O no disco (localStorage) para evitar micro-travamentos na UI.
 */
export function useDebouncedLocalStorage<T> ( key: string, initialValue: T, delay: number = 300 ): [ T, ( val: T ) => void ] {
    const [ storedValue, setStoredValue ] = useState<T>( initialValue );
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>( null );

    useEffect( () => {
        try
        {
            const item = globalThis.window.localStorage.getItem( key );
            if ( item !== null ) setStoredValue( JSON.parse( item ) );
        } catch ( error )
        {
            console.debug( `[useDebouncedLocalStorage] Falha ao carregar a chave "${key}":`, error );
        }
    }, [ key ] );

    const setValue = ( value: T ) => {
        setStoredValue( value ); // Síncrono para a UI

        if ( timeoutRef.current ) clearTimeout( timeoutRef.current );

        timeoutRef.current = setTimeout( () => {
            try
            {
                globalThis.window.localStorage.setItem( key, JSON.stringify( value ) );
            } catch ( error )
            {
                console.debug( `[useDebouncedLocalStorage] Falha ao persistir a chave "${key}":`, error );
            }
        }, delay );
    };

    return [ storedValue, setValue ];
}
