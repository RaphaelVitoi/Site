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
function parsePlayerFromLine(line: string, index: number): ICMPlayer | null {
	const trimmed = line.trim();
	if (!trimmed.startsWith('Seat')) return null;

	const colonIdx = trimmed.indexOf(':');
	const parenOpenIdx = trimmed.indexOf('(', colonIdx);
	if (colonIdx === -1 || parenOpenIdx === -1) return null;

	const name = trimmed.slice(colonIdx + 1, parenOpenIdx).trim();
	if (!name) return null;

	const afterParen = trimmed.slice(parenOpenIdx + 1);
	const parenCloseIdx = afterParen.indexOf(')');
	const stackContent = (parenCloseIdx !== -1 ? afterParen.slice(0, parenCloseIdx) : afterParen).replace(/^\$/, '');

	const numMatch = /[\d,.]+/.exec(stackContent);
	if (!numMatch) return null;

	const rawStack = numMatch[0].replaceAll(',', '');
	const stack = Number.parseFloat(rawStack);
	if (Number.isNaN(stack) || stack <= 0) return null;

	return {
		id:
			typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
				? crypto.randomUUID()
				: `player_${Date.now()}_${index + 1}`,
		name,
		stack: Math.round(stack),
	};
}

export function parseHandHistory(rawText: string): ICMPlayer[] {
	if (!rawText || typeof rawText !== 'string') return [];

	const lines = rawText.split(/\r?\n/);
	const players: ICMPlayer[] = [];

	lines.forEach((line, index) => {
		const player = parsePlayerFromLine(line, index);
		if (player) players.push(player);
	});

	return players;
}
