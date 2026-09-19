/** @format */

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Estado espelhado no localStorage com gravação adiada.
 *
 * Devolve `[valor, definir, carregado]`. `carregado` só vira `true` DEPOIS que o valor salvo foi
 * lido e aplicado ao estado. Até 2026-09-17 não havia esse sinal: quem hidratava a partir deste
 * hook no mesmo commit via ainda o valor inicial, marcava-se hidratado e gravava o padrão por cima
 * do que o usuário salvara (FE-02).
 *
 * `validar` recusa um valor salvo com forma incompatível — de uma versão anterior do schema, ou
 * editado à mão — em vez de propagá-lo como `T`.
 */
export function useDebouncedLocalStorage<T>(
	key: string,
	initialValue: T,
	delay: number = 150,
	validar: (valor: unknown) => valor is T = (_valor: unknown): _valor is T => true,
): [T, (val: T) => void, boolean] {
	const [value, setValue] = useState<T>(initialValue);
	const [isLoaded, setIsLoaded] = useState(false);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const pendingRef = useRef<{ key: string; value: T } | null>(null);
	const validarRef = useRef(validar);
	validarRef.current = validar;

	useEffect(() => {
		const aplicar = (bruto: string | null) => {
			if (!bruto) return;
			try {
				const parsed: unknown = JSON.parse(bruto);
				if (validarRef.current(parsed)) setValue(parsed);
				else console.warn(`[useDebouncedLocalStorage] Valor salvo em "${key}" com forma incompatível; mantido o padrão.`);
			} catch (error: unknown) {
				console.warn('[useDebouncedLocalStorage] Parse error:', error instanceof Error ? error.message : error);
			}
		};

		try {
			aplicar(globalThis.localStorage?.getItem(key) ?? null);
		} catch {
			// localStorage bloqueado (modo privado, política de site): segue com o valor inicial.
		}
		setIsLoaded(true);

		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === key) aplicar(e.newValue);
		};
		globalThis.addEventListener('storage', handleStorageChange);

		return () => {
			globalThis.removeEventListener('storage', handleStorageChange);
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
			// Grava a alteração pendente em vez de descartá-la ao desmontar (FE-14).
			if (pendingRef.current) gravar(pendingRef.current.key, pendingRef.current.value);
			pendingRef.current = null;
		};
	}, [key]);

	const setDebouncedValue = useCallback(
		(newValue: T) => {
			setValue(newValue);
			if (globalThis.window === undefined) return;

			pendingRef.current = { key, value: newValue };
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
			timeoutRef.current = setTimeout(() => {
				if (pendingRef.current) gravar(pendingRef.current.key, pendingRef.current.value);
				pendingRef.current = null;
			}, delay);
		},
		[key, delay],
	);

	return [value, setDebouncedValue, isLoaded];
}

function gravar(key: string, value: unknown): void {
	try {
		globalThis.localStorage.setItem(key, JSON.stringify(value));
	} catch (error: unknown) {
		// Quota excedida ou armazenamento bloqueado: o estado em memória continua valendo (FE-14).
		console.warn('[useDebouncedLocalStorage] Falha ao gravar:', error instanceof Error ? error.message : error);
	}
}
