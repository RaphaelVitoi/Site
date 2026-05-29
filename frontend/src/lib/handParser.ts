/**
 * IDENTITY: Hand History Parser (Motor de Ingestão Sintética)
 * PATH: src/lib/handParser.ts
 * ROLE: Ingerir texto bruto de trackers (Hand2Note, PokerStars) e extrair nomes e stacks via Heurística de Regex.
 * BINDING: [src/components/simulator/panels/EquityCalculator.tsx]
 * TELEOLOGY: Eliminar a fricção cognitiva humana da digitação manual no simulador, pavimentando o caminho para a ingestão massiva de dados (MDA) de torneios.
 */

import { type ICMPlayer } from './icmEngine';

/**
 * Processa um bloco de texto contendo uma mão de Poker (formato PokerStars / Hand2Note)
 * e extrai o ID do assento, o nome do jogador e a stack inicial.
 *
 * Padrão-alvo: "Seat 1: Raphael Vitoi (15000 in chips)"
 *
 * @param rawText String contendo o histórico de mão bruto colado pelo usuário.
 * @returns Array de jogadores formatado para a calculadora ICM.
 */
export function parseHandHistory(rawText: string): ICMPlayer[] {
	if (!rawText || typeof rawText !== 'string') return [];

	const players: ICMPlayer[] = [];

	// Heuristica principal: PokerStars, GGPoker, WPN, Hand2Note
	// Captura stacks com virgulas (15,000), decimais (15000.50) e cifrao ($15,000)
	// SOTA: Otimização contra ReDoS mantida, com flexibilidade estrutural para sufixos PKO e GGPoker (, $25 bounty)
	const regex = /Seat \d+:\s*([^(]+?)\s*\(\s*\$?\s*([\d,]+(?:\.\d+)?)[^)]*\)/gi;
	let match: RegExpExecArray | null;

	while ((match = regex.exec(rawText)) !== null) {
		const name = match[1]?.trim();
		const rawStack = match[2]?.replaceAll(',', '');

		if (!name || !rawStack) continue;

		const stack = Number.parseFloat(rawStack);

		// Previne dados corrompidos
		if (name && !Number.isNaN(stack) && stack > 0) {
			players.push({
				id:
					typeof crypto !== 'undefined' && crypto.randomUUID
						? crypto.randomUUID()
						: Date.now().toString(36) + Math.random().toString(36).substring(2),
				name,
				stack: Math.round(stack),
			});
		}
	}

	return players;
}
