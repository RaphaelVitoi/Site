'use client';

import { type PhysicsSnapshot } from '@/lib/schemas';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDebouncedLocalStorage } from './useDebouncedLocalStorage';

// ============================================================================
// IDENTITY: SOTA Global Sync Provider (Decoupled Stateful Workflow)
// ROLE: Mantém a "Física da Mesa" sincronizada entre todos os simuladores
//       através de um Contexto global ancorado no LocalStorage.
// ============================================================================

export interface SotaPhysicsState extends PhysicsSnapshot {
	prizes: number[];
}

const defaultPhysics: SotaPhysicsState = {
	heroStack: 40,
	villain1Stack: 30,
	villain2Stack: 30,
	pot: 15,
	heroInvested: 5,
	edgeFactor: 1.2,
	position: 'OOP',
	referenceStatus: 'baseline',
	prizes: [237.34, 170.96, 135.17, 109.99, 90.28, 73.95, 59.92, 47.56, 36.47],
};

interface SotaSyncContextType {
	physics: SotaPhysicsState;
	updatePhysics: (partial: Partial<SotaPhysicsState>) => void;
	isHydrated: boolean;
}

const SotaSyncContext = createContext<SotaSyncContextType | null>(null);

export function SotaGlobalSyncProvider({ children }: { readonly children: React.ReactNode }) {
	const [storedPhysics, setStoredPhysics] = useDebouncedLocalStorage<SotaPhysicsState>(
		'sota-physics-v1',
		defaultPhysics,
	);
	const [physics, setPhysics] = useState<SotaPhysicsState>(defaultPhysics);
	const [isHydrated, setIsHydrated] = useState(false);

	// Hidratação (Client-Side) garantindo sincronia sem flicker
	useEffect(() => {
		if (!isHydrated) {
			if (storedPhysics) {
				setPhysics(storedPhysics);
			}
			setIsHydrated(true);
		}
	}, [storedPhysics, isHydrated]);

	const updatePhysics = React.useCallback((partial: Partial<SotaPhysicsState>) => {
		setPhysics((prev) => {
			return { ...prev, ...partial };
		});
	}, []);

	// SOTA: Isolamento de Side-Effects (Fricção Zero)
	// Removemos a mutação de I/O de dentro do 'setPhysics', garantindo que o State Updater seja Puro.
	// Impede que o React Strict Mode ou o Concurrent Mode disparem escritas redundantes durante Stress Tests.
	useEffect(() => {
		if (isHydrated) setStoredPhysics(physics);
	}, [physics, isHydrated, setStoredPhysics]);

	const contextValue = React.useMemo(
		() => ({
			physics,
			updatePhysics,
			isHydrated,
		}),
		[physics, updatePhysics, isHydrated],
	);

	return <SotaSyncContext.Provider value={contextValue}>{children}</SotaSyncContext.Provider>;
}

export function useSotaSync() {
	const context = useContext(SotaSyncContext);
	if (!context) {
		throw new Error('useSotaSync deve ser usado dentro de um SotaGlobalSyncProvider');
	}
	return context;
}
