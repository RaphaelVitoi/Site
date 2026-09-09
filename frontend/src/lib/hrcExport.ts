import type { ICMPlayer } from './icmEngine';
import { generateHRCHandConfig } from './hrcFormat';

/** Legacy caller adapter. PKO weight is not a per-player bounty configuration. */
export function generateHRCJson(players: ICMPlayer[], prizes: number[], pkoWeight = 0): string {
  if (pkoWeight !== 0) throw new Error('Para exportar PKO, são necessários bounties por jogador e um modelo de bounty. O peso exploratório não define esse setup.');
  return generateHRCHandConfig(players, prizes, { selection: { room: 'PokerStars', playerIds: players.map(p => p.id), participantIds: [] } });
}

/**
 * Aciona o download do arquivo JSON no navegador.
 */
export function downloadHRCJson(json: string, filename: string = 'vitoi_scenario_hrc.json') {
	// SOTA: Check de SSR nativo para evitar explosão de APIs do DOM no Next.js Server
	if (globalThis.window === undefined || globalThis.document === undefined) return;

	const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	link.remove();

	// SOTA: Prevenção de revogação prematura que cancela o download no Safari/iOS
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}
