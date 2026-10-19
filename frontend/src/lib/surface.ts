/**
 * SOTA: Arquitetura de Superfícies & Temas
 * Centraliza a inteligência de superfícies editoriais e laboratoriais do Poker Racional.
 * Elimina duplicações da verificação de páginas editoriais claras (Light Editorial).
 */

export const LIGHT_EDITORIAL_ROUTES = ['/', '/quem-sou'] as const;

export type LightEditorialRoute = (typeof LIGHT_EDITORIAL_ROUTES)[number];

/**
 * Retorna true se o pathname atual corresponder a uma superfície editorial clara.
 */
export function isLightPage(pathname: string | null | undefined): boolean {
	if (!pathname) return false;
	return pathname === '/' || pathname === '/quem-sou';
}

/**
 * Retorna true se o pathname corresponder a uma página de leitura/conteúdo longo
 * (Biblioteca ou Aulas) que exibe a barra de progresso de leitura.
 */
export function isReadingContentPage(pathname: string | null | undefined): boolean {
	if (!pathname) return false;
	return pathname.startsWith('/biblioteca/') || pathname.startsWith('/aulas/');
}
