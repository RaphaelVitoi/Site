'use client';

import { useCallback } from 'react';
import type { ChipEvFreqs, StreetChipEvFreqs } from '@/components/simulator/solver/types';

/**
 * SOTA: Entanglement Quântico Verdadeiro (A Árvore Viva)
 * Aplica a propagação de frequências entre as streets.
 */
function applyFrequencyPropagation(
	sourceDeltas: Partial<ChipEvFreqs>,
	targetFreqs: ChipEvFreqs,
	attenuation: number,
): ChipEvFreqs {
	const target = { ...targetFreqs };

	// Reação do OOP: Foldar mais no Flop = Range mais FORTE no Turn (Menos Fold, Mais Raise)
	if (sourceDeltas.oop_fold) {
		target.oop_fold = Math.max(0, target.oop_fold - sourceDeltas.oop_fold * attenuation * 0.8);
		target.oop_raise = Math.max(
			0,
			target.oop_raise + sourceDeltas.oop_fold * attenuation * 0.4,
		);
		target.ip_check = Math.max(0, target.ip_check + sourceDeltas.oop_fold * attenuation * 0.5);
		target.ip_bet_large = Math.max(
			0,
			target.ip_bet_large - sourceDeltas.oop_fold * attenuation * 0.5,
		);
	}
	if (sourceDeltas.oop_raise) {
		target.oop_raise = Math.max(
			0,
			target.oop_raise - sourceDeltas.oop_raise * attenuation * 0.5,
		);
		target.oop_fold = Math.max(0, target.oop_fold + sourceDeltas.oop_raise * attenuation * 0.3);
		target.ip_check = Math.max(0, target.ip_check + sourceDeltas.oop_raise * attenuation * 0.6);
	}

	// Reação do IP: Apostar grande significa polarizar o range (Mais passividade no Turn)
	if (sourceDeltas.ip_bet_large) {
		target.ip_bet_large = Math.max(
			0,
			target.ip_bet_large - sourceDeltas.ip_bet_large * attenuation * 0.6,
		);
		target.ip_check = Math.max(
			0,
			target.ip_check + sourceDeltas.ip_bet_large * attenuation * 0.6,
		);
		target.oop_fold = Math.max(
			0,
			target.oop_fold + sourceDeltas.ip_bet_large * attenuation * 0.4,
		);
	}
	if (sourceDeltas.ip_check) {
		target.ip_bet_small = Math.max(
			0,
			target.ip_bet_small + sourceDeltas.ip_check * attenuation * 0.5,
		);
		target.oop_raise = Math.max(
			0,
			target.oop_raise + sourceDeltas.ip_check * attenuation * 0.3,
		);
	}

	// Normalização para preservar o tecido da realidade (100%)
	const ipSum = target.ip_check + target.ip_bet_small + target.ip_bet_large;
	if (ipSum > 0) {
		target.ip_check = (target.ip_check / ipSum) * 100;
		target.ip_bet_small = (target.ip_bet_small / ipSum) * 100;
		target.ip_bet_large = (target.ip_bet_large / ipSum) * 100;
	}

	const oopSum = target.oop_call + target.oop_fold + target.oop_raise;
	if (oopSum > 0) {
		target.oop_call = (target.oop_call / oopSum) * 100;
		target.oop_fold = (target.oop_fold / oopSum) * 100;
		target.oop_raise = (target.oop_raise / oopSum) * 100;
	}

	return target;
}

/**
 * SOTA: Isolamento de Funções Puras para Erradicar Complexidade Ciclomática
 */
function calculateFreqDeltas(
	oldFreqs: ChipEvFreqs,
	newFreqs: ChipEvFreqs,
): { deltas: Partial<ChipEvFreqs>; hasChange: boolean } {
	const deltas: Partial<ChipEvFreqs> = {};
	let hasChange = false;
	for (const [key, newVal] of Object.entries(newFreqs) as Array<[keyof ChipEvFreqs, number]>) {
		const oldVal = Reflect.get(oldFreqs, key) ?? 0;
		const d = newVal - oldVal;
		Reflect.set(deltas, key, d);
		if (Math.abs(d) > 0.1) hasChange = true;
	}
	return { deltas, hasChange };
}

function getStreetFreqs(container: StreetChipEvFreqs, street: keyof StreetChipEvFreqs): ChipEvFreqs {
	if (street === 'flop') return container.flop;
	if (street === 'turn') return container.turn;
	return container.river;
}

function propagateFrequencies(
	prev: StreetChipEvFreqs,
	street: keyof StreetChipEvFreqs,
	deltas: Partial<ChipEvFreqs>,
): StreetChipEvFreqs {
	const next: StreetChipEvFreqs = {
		flop: { ...prev.flop },
		turn: { ...prev.turn },
		river: { ...prev.river },
	};

	const propagate = (targetStreet: keyof StreetChipEvFreqs, attenuation: number) => {
		const currentStreetFreqs = getStreetFreqs(next, targetStreet);
		const updated = applyFrequencyPropagation(deltas, currentStreetFreqs, attenuation);
		if (targetStreet === 'flop') next.flop = updated;
		else if (targetStreet === 'turn') next.turn = updated;
		else if (targetStreet === 'river') next.river = updated;
	};

	if (street === 'flop') {
		propagate('turn', 0.4); // Preditiva Forte
		propagate('river', 0.15); // Preditiva Difusa
	} else if (street === 'turn') {
		propagate('flop', 0.3); // Retroativa Forte
		propagate('river', 0.35); // Preditiva Forte
	} else if (street === 'river') {
		propagate('turn', 0.4); // Retroativa Forte
		propagate('flop', 0.15); // Retroativa Difusa
	}
	return next;
}

export function useFrequencyPropagation(
	setStreetFreqs: React.Dispatch<React.SetStateAction<StreetChipEvFreqs>>,
) {
	const handleStreetFreqChange = useCallback(
		(street: keyof StreetChipEvFreqs, freqs: ChipEvFreqs) => {
			setStreetFreqs((prev: StreetChipEvFreqs) => {
				const currentFreqs = getStreetFreqs(prev, street);
				const { deltas, hasChange } = calculateFreqDeltas(currentFreqs, freqs);
				if (!hasChange) return { ...prev, [street]: freqs };
				const next = propagateFrequencies(prev, street, deltas);
				if (street === 'flop') next.flop = { ...freqs };
				else if (street === 'turn') next.turn = { ...freqs };
				else if (street === 'river') next.river = { ...freqs };
				return next;
			});
		},
		[setStreetFreqs],
	);

	return { handleStreetFreqChange };
}
