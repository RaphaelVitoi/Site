import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Função 'cn' (Class Name):
 * Combina o 'clsx' para lógica condicional e o 'twMerge'
 * para limpar conflitos de classes do Tailwind.
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
