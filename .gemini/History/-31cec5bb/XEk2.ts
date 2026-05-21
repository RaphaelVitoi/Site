import { useEffect, useState } from 'react';
export function useDebouncedLocalStorage<T>( key: string, initialValue: T, delay: number = 500 ): [T, ( val: T ) => void] {
    const [value, setValue] = useState<T>( initialValue );
    useEffect( () => {
        try {
            const item = window.localStorage.getItem( key );
            if ( item ) setValue( JSON.parse( item ) );
        } catch ( error ) {
            console.warn( error );
        }
    }, [key] );
    const setDebouncedValue = ( newValue: T ) => {
        setValue( newValue );
        window.localStorage.setItem( key, JSON.stringify( newValue ) );
    };
    return [value, setDebouncedValue];
}
