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
	heroStack: number;
	pot: number;
	heroInvested: number;
	position: 'IP' | 'OOP' | 'BB' | 'SB';
	referenceStatus: 'baseline' | 'tilt' | 'protecting' | 'bubble';
	edgeFactor?: number;
	villain1Stack?: number;
	villain2Stack?: number;
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

const POSICOES: ReadonlySet<unknown> = new Set<SotaPhysicsState['position']>(['IP', 'OOP', 'BB', 'SB']);
const STATUS: ReadonlySet<unknown> = new Set<SotaPhysicsState['referenceStatus']>(['baseline', 'tilt', 'protecting', 'bubble']);
const numeroFinito = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** Recusa estado salvo com forma de outra versão do schema, em vez de propagá-lo como válido. */
export function isSotaPhysicsState(valor: unknown): valor is SotaPhysicsState {
	if (typeof valor !== 'object' || valor === null || Array.isArray(valor)) return false;
	const v = valor as Record<string, unknown>;
	return (
		numeroFinito(v['heroStack']) &&
		numeroFinito(v['pot']) &&
		numeroFinito(v['heroInvested']) &&
		POSICOES.has(v['position']) &&
		STATUS.has(v['referenceStatus']) &&
		Array.isArray(v['prizes']) &&
		v['prizes'].every(numeroFinito)
	);
}

export function SotaGlobalSyncProvider({ children }: { readonly children: React.ReactNode }) {
	const [storedPhysics, setStoredPhysics, isStorageLoaded] = useDebouncedLocalStorage<SotaPhysicsState>(
		'sota-physics-v1',
		defaultPhysics,
		150,
		isSotaPhysicsState,
	);
	const [physics, setPhysics] = useState<SotaPhysicsState>(defaultPhysics);
	const [isHydrated, setIsHydrated] = useState(false);

	// Hidratação: só depois que o hook terminou de ler o localStorage. Hidratar antes disso copiava
	// o padrão e, na sequência, o efeito de persistência gravava o padrão por cima do salvo (FE-02).
	useEffect(() => {
		if (isHydrated || !isStorageLoaded) return;
		setPhysics({ ...defaultPhysics, ...storedPhysics });
		setIsHydrated(true);
	}, [storedPhysics, isStorageLoaded, isHydrated]);

	const updatePhysics = React.useCallback((partial: Partial<SotaPhysicsState>) => {
		setPhysics((prev) => {
			let changed = false;
			for (const [key, val] of Object.entries(partial) as Array<[keyof SotaPhysicsState, unknown]>) {
				if (Reflect.get(prev, key) !== val) {
					changed = true;
					break;
				}
			}
			if (!changed) return prev;
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
