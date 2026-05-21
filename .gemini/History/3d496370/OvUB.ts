/**
 * IDENTITY: Testes Automatizados SOTA (@verifier)
 * PATH: src/components/simulator/engine/nashSolver.test.ts
 * ROLE: Validar a sanidade matemática da engine de Nash e do cálculo de equidade sob pressão de ICM.
 */

import { describe, it, expect } from 'vitest';
import { solveNash, simulateHand } from './nashSolver';

describe('Engine ICM SOTA: Nash Solver', () => {
    describe('solveNash (Equilíbrio Dinâmico IP vs OOP)', () => {

        it('Deve retornar a Baseline GTO (Pot-Sized Bet) quando o Risk Premium (RP) for zero', () => {
            const result = solveNash(0, 0, 1.0);

            // Sem pressão (ChipEV), Alpha (Blefe) deve ser 33.3% e MDF (Defesa) deve ser 50%
            expect(result.bluffFreq).toBeCloseTo(33.3, 1);
            expect(result.defenseFreq).toBeCloseTo(50.0, 1);
        });

        it('Deve estrangular o MDF do Defensor (Overfold) quando ele entra na Death Zone (RP >= 40%)', () => {
            // Agressor confortável (10% RP) atacando defensor sob ameaça de ruína (45% RP)
            const result = solveNash(10, 45, 1.0);

            expect(result.defenseFreq).toBeLessThan(40); // Defesa entra em colapso
            expect(result.bluffFreq).toBeGreaterThan(33.3); // Agressor explora o overfold
            expect(result.verdict).toBeDefined();
        });

        it('Deve invocar o "Pacto Silencioso" quando ambos estão na Death Zone (Colisão de Gigantes)', () => {
            const result = solveNash(40, 40, 1.0);

            // Se ambos arriscam o torneio, a agressão e a defesa são contraídas agressivamente
            expect(result.bluffFreq).toBeLessThan(33.3);
            expect(result.defenseFreq).toBeLessThan(50.0);
        });

        it('Deve respeitar o Multiplicador de Agressividade de entrada', () => {
            const baseline = solveNash(15, 15, 1.0);
            const passive = solveNash(15, 15, 0.5);

            expect(passive.bluffFreq).toBeLessThan(baseline.bluffFreq);
        });
    });

    describe('simulateHand (Simulador de Confronto Isolado)', () => {

        it('Deve recomendar CALL com +EV quando a equidade da mão excede o mínimo necessário pelo ICM', () => {
            const result = simulateHand(65, 50); // Mão tem 65%, precisa de 50%

            expect(result.decision).toBe('CALL');
            expect(result.ev).toBeGreaterThan(0);
            expect(result.ev).toBeCloseTo(15, 1); // EV de margem = 65 - 50 = +15%
        });

        it('Deve recomendar FOLD cirúrgico em cenários de Death Zone com equidade insuficiente', () => {
            // Em RP=45%, a equidade necessária salta para ~64.8%
            const requiredEq = 33.3 + (45 * 0.7);
            const result = simulateHand(60, requiredEq); // Mão favorita (60%), mas insuficiente para o torneio

            expect(result.decision).toBe('FOLD');
            expect(result.ev).toBeLessThan(0);
        });

    });
});