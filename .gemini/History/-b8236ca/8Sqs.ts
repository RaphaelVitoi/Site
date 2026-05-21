/**
 * IDENTITY: Hand History Parser (Motor de Ingestão Sintética)
 * PATH: src/lib/handParser.ts
 * ROLE: Ingerir texto bruto de trackers (Hand2Note, PokerStars) e extrair nomes e stacks via Heurística de Regex.
 * BINDING: [src/components/ICMCalculator.tsx]
 * TELEOLOGY: Eliminar a fricção cognitiva humana da digitação manual no simulador, pavimentando o caminho para a ingestão massiva de dados (MDA) de torneios.
 */

import { ICMPlayer } from './icmEngine';

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
  const players: ICMPlayer[] = [];
  
  // Heurística principal de varredura (Ignora case e busca o padrão de assento/chips)
  const regex = /Seat \d+: (.*?) \((\d+)(?: in chips)?\)/gi;
  let match;

  while ((match = regex.exec(rawText)) !== null) {
    const name = match[1].trim();
    const stack = parseInt(match[2], 10);
    
    // Previne dados corrompidos
    if (name && !isNaN(stack)) {
      players.push({
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        name,
        stack
      });
    }
  }

  return players;
}