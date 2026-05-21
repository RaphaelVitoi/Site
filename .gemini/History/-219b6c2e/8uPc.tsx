'use client';

import { ReferencePointStatus } from '@/lib/perspectiva';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDebouncedLocalStorage } from './useDebouncedLocalStorage';

// ============================================================================
// IDENTITY: SOTA Global Sync Provider (Decoupled Stateful Workflow)
// ROLE: Mantém a "Física da Mesa" sincronizada entre todos os simuladores
//       através de um Contexto global ancorado no LocalStorage.
// ============================================================================

export interface SotaPhysicsState {
    heroStack: number;
    villain1Stack: number;
    villain2Stack: number;
    pot: number;
    heroInvested: number;
    edgeFactor: number;
    position: 'IP' | 'OOP';
    referenceStatus: ReferencePointStatus;
}

const defaultPhysics: SotaPhysicsState = {
    heroStack: 40,
    villain1Stack: 30,
    villain2Stack: 30,
    pot: 15,
    heroInvested: 5,
    edgeFactor: 1.2,
    position: 'OOP',
    referenceStatus: 'baseline'
};

interface SotaSyncContextType {
    physics: SotaPhysicsState;
    updatePhysics: ( partial: Partial<SotaPhysicsState> ) => void;
    isHydrated: boolean;
}

const SotaSyncContext = createContext<SotaSyncContextType | null>( null );

export function SotaGlobalSyncProvider( { children }: Readonly<{ children: React.ReactNode }> ) {
    const [storedPhysics, setStoredPhysics] = useDebouncedLocalStorage<SotaPhysicsState>( 'sota-physics-v1', defaultPhysics );
    const [physics, setPhysics] = useState<SotaPhysicsState>( defaultPhysics );
    const [isHydrated, setIsHydrated] = useState( false );

    // Hidratação (Client-Side) garantindo sincronia sem flicker
    useEffect( () => {
        if ( storedPhysics ) {
            setPhysics( storedPhysics );
        }
        setIsHydrated( true );
    }, [storedPhysics] );

    const updatePhysics = React.useCallback( ( partial: Partial<SotaPhysicsState> ) => {
        setPhysics( prev => {
            const newState = { ...prev, ...partial };
            setStoredPhysics( newState ); // Persiste no LocalStorage debounceado
            return newState;
        } );
    }, [setStoredPhysics] );

    const contextValue = React.useMemo( () => ( {
        physics,
        updatePhysics,
        isHydrated
    } ), [physics, updatePhysics, isHydrated] );

    return (
        <SotaSyncContext.Provider value={ contextValue }>
            { children }
        </SotaSyncContext.Provider>
    );
}

export function useSotaSync() {
    const context = useContext( SotaSyncContext );
    if ( !context ) {
        throw new Error( 'useSotaSync deve ser usado dentro de um SotaGlobalSyncProvider' );
    }
    return context;
}
