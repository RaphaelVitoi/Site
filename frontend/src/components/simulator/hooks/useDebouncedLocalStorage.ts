/** @format */

import { useEffect, useState, useCallback, useRef } from 'react';

export function useDebouncedLocalStorage<T>(
	key: string,
	initialValue: T,
	delay: number = 150,
): [T, (val: T) => void] {
	const [value, setValue] = useState<T>(initialValue);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		try {
			const item =
				globalThis.window === undefined ? null : globalThis.localStorage.getItem(key);
			if (item) {
				setValue(JSON.parse(item));
			}
		} catch (error: unknown) {
			let errorMessage = 'Erro de parse no localStorage.';
			if (error instanceof Error) errorMessage = error.message;
			else if (typeof error === 'string') errorMessage = error;
			console.warn('[useDebouncedLocalStorage] Parse error:', errorMessage);
		}

		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === key && e.newValue) {
				try {
					setValue(JSON.parse(e.newValue));
				} catch (err) {
					console.warn('[useDebouncedLocalStorage] Sync error:', err);
				}
			}
		};

		globalThis.addEventListener('storage', handleStorageChange);
		return () => {
			globalThis.removeEventListener('storage', handleStorageChange);
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, [key]);

	const setDebouncedValue = useCallback(
		(newValue: T) => {
			// 1. Atualização imediata do estado em memória (UI responsiva)
			setValue(newValue);

			if (globalThis.window === undefined) return;

			// 2. Debounce do I/O de persistência
			if (timeoutRef.current) clearTimeout(timeoutRef.current);

			timeoutRef.current = setTimeout(() => {
				globalThis.localStorage.setItem(key, JSON.stringify(newValue));
				// Dispara um evento customizado para a própria aba (já que 'storage' só avisa as outras)
				globalThis.dispatchEvent(
					new StorageEvent('storage', {
						key,
						newValue: JSON.stringify(newValue),
					}),
				);
			}, delay);
		},
		[key, delay],
	);

	return [value, setDebouncedValue];
}
