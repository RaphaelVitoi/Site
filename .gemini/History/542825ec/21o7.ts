import { useEffect, useState, useCallback } from 'react';

export function useDebouncedLocalStorage<T>(key: string, initialValue: T, delay: number = 500): [T, (val: T) => void]
{
    const [ value, setValue ] = useState<T>( initialValue );

    useEffect( () =>
    {
        try
        {
            const item = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
            if (item) {
                setValue(JSON.parse(item));
            }
        } catch ( error: unknown )
        {
            console.warn( "[useDebouncedLocalStorage] Parse error:", error instanceof Error ? error.message : String( error ) );
        }

        // SOTA: Sincronização Cross-Tab (Fricção Zero entre múltiplas abas do simulador)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === key && e.newValue) {
                try {
                    setValue(JSON.parse(e.newValue));
                } catch (err) {
                    console.warn("[useDebouncedLocalStorage] Sync error:", err);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [ key ] );

    // SOTA: Memoização para evitar re-renders desnecessários nos painéis do MasterSimulator
    const setDebouncedValue = useCallback((newValue: T) =>
    {
        setValue( newValue );
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, JSON.stringify(newValue));
            // Dispara um evento customizado para a própria aba (já que 'storage' só avisa as outras)
            window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(newValue) }));
        }
    }, [key]);

    return [ value, setDebouncedValue ];
}
