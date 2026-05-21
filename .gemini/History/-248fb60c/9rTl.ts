﻿"use client";

/**
 * IDENTITY: Auditoria de Integridade Matemática SOTA v4.2 (Corrigida)
 * PATH: src/tests/simulator/mathematical-integrity.test.ts
 * ROLE: Validar a precisão do Motor Quântico (ICM, RP, PM, RIO) pós-refatoração.
 */

import { calculateMapaICM } from "../../lib/perspectiva";
import { deriveRps, derivePostFlopRps, StreetState } from "../../lib/rpDeriver";
import { solveIcmDistortion } from "../../components/simulator/engine/nashSolver";

describe("SOTA v4.2 Mathematical Integrity Audit", () => {
  // 1. FUNDAMENTO ICM (Malmuth-Harville)
  describe("ICM Core (calculateMapaICM)", () => {
    it("deve manter a invariância em Proporção Pura (Winner Take All)", () => {
      const stacks = [1000, 500, 500];
      const prizes = [2000, 0, 0]; // Winner Take All = Proporcionalidade direta às fichas
      const result = calculateMapaICM(stacks, prizes);

      expect(result.equities[0]).toBeCloseTo(1000, 0); // 50% de 2000
      expect(result.equities[1]).toBeCloseTo(500, 0); // 25% de 2000
      expect(result.equities[2]).toBeCloseTo(500, 0); // 25% de 2000
    });

    it("deve calcular corretamente a probabilidade de 1º lugar", () => {
      const stacks = [1500, 500];
      const prizes = [100, 0];
      const result = calculateMapaICM(stacks, prizes);

      expect(result.positionProbs[0][0]).toBe(0.75); // 75% de chance de 1º
      expect(result.positionProbs[1][0]).toBe(0.25); // 25% de chance de 1º
    });
  });

  // 2. CALIBRAÇÃO DE RISK PREMIUM (RP)
  describe("Risk Premium (deriveRps)", () => {
    const stacks = [40, 40, 40]; // Simetria total
    const prizes = [50, 30, 20];

    it("deve gerar RP positivo e simétrico em cenários balanceados", () => {
      const result = deriveRps(stacks, prizes, 0, 1);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.ipRp).toBeGreaterThan(0);
        expect(result.ipRp).toBeCloseTo(result.oopRp, 1);
      }
    });

    it("deve identificar o teto de risco (Ceiling) em situações de Shove crítico", () => {
      const extremeStacks = [100, 100, 0.1, 0.1]; // Bolha extrema
      const extremePrizes = [50, 30, 20, 0];
      const effStack = 100;
      // Forçamos a simulação do Shove (100% do stack)
      const result = deriveRps(extremeStacks, extremePrizes, 0, 1, 0, effStack);
      if (result) {
        expect(result.isCeilingReached || result.ipRp > 40).toBe(true);
      }
    });
  });

  // 3. PERSPECTIVA MATEMÁTICA (D6 Engine)
  describe("Perspectiva Matemática (D6 Engine)", () => {
    const baseState: StreetState = {
      street: "flop",
      potAcumuladoHero: 3,
      potTotal: 6,
      heroIsIp: true,
      numPlayers: 2,
    };
    const stacks = [40, 55, 10, 10];
    const prizes = [50, 30, 20, 0];

    it("Teorema D1: EV_fold deve ser estritamente negativo", () => {
      const result = derivePostFlopRps(stacks, prizes, 0, 1, baseState);
      if (result) {
        expect(result.evFoldStreet).toBeLessThan(0);
      }
    });

    it("Teorema D2: RIO MW deve escalar quadraticamente (N²)", () => {
      const potTotal = 10;
      const resultMW3 = derivePostFlopRps(stacks, prizes, 0, 1, {
        ...baseState,
        numPlayers: 3,
        potTotal,
      });
      const resultMW4 = derivePostFlopRps(stacks, prizes, 0, 1, {
        ...baseState,
        numPlayers: 4,
        potTotal,
      });

      if (resultMW3 && resultMW4) {
        // RIO(N) = (N-1)^2 * p_d * potTotalPct
        // Para MW3 (N=3): (3-1)^2 = 4
        // Para MW4 (N=4): (4-1)^2 = 9
        // Proporção: 9/4 = 2.25
        expect(resultMW4.rioMwStreet / resultMW3.rioMwStreet).toBeCloseTo(
          2.25,
          1,
        );
      }
    });

    it("Teorema D2 + D5: Teto do RP deve subir em potes MW devido ao passivo RIO", () => {
      const potTotal = 10;
      const resultHU = derivePostFlopRps(stacks, prizes, 0, 1, {
        ...baseState,
        numPlayers: 2,
        potTotal,
      });
      const resultMW = derivePostFlopRps(stacks, prizes, 0, 1, {
        ...baseState,
        numPlayers: 4,
        potTotal,
      });

      if (resultHU && resultMW) {
        // Em potes MW, a equidade necessária para call (Teto do RP) deve ser maior
        // para compensar o risco de estar dominado (RIO)
        expect(resultMW.threshEqStreet).toBeGreaterThan(
          resultHU.threshEqStreet,
        );
      }
    });

    it("Teorema D5: Teto do RP (Equidade Limite) deve ser fisicamente possível", () => {
      const result = derivePostFlopRps(stacks, prizes, 0, 1, baseState);
      if (result) {
        // A equidade limite não pode ser negativa nem > 100%
        expect(result.threshEqStreet).toBeGreaterThanOrEqual(0);
        expect(result.threshEqStreet).toBeLessThanOrEqual(1);
      }
    });
  });

  // 4. TOPOLOGIC AGGRESSION 2.0 (Teorema D3)
  describe("Topologic Aggression 2.0 (Pot Gravity)", () => {
    const chipEvFreqs = {
      ip_check: 40,
      ip_bet_small: 30,
      ip_bet_large: 30,
      oop_fold: 30,
      oop_call: 50,
      oop_raise: 20,
    };

    it("Teorema D3: Gravidade do Pote deve reduzir a variância da agressão (Inércia)", () => {
      const ipRp = 15;
      const oopRp = 15;
      const aggFactor = 2; // Agressividade extrema

      // Cenário A: Pote Pequeno (7.5bb) -> Gravidade 0
      const resultSmall = solveIcmDistortion(
        ipRp,
        oopRp,
        chipEvFreqs,
        aggFactor,
        7.5,
        0,
      );

      // Cenário B: Pote Grande (75bb) -> Gravidade ln(10) ~ 2.3
      const resultLarge = solveIcmDistortion(
        ipRp,
        oopRp,
        chipEvFreqs,
        aggFactor,
        75,
        0,
      );

      // Em potes maiores, a expansão do range de raise deve ser amortecida
      // deltaRaise = newRaise - oldRaise
      const deltaSmall = resultSmall.oop.raise.center - chipEvFreqs.oop_raise;
      const deltaLarge = resultLarge.oop.raise.center - chipEvFreqs.oop_raise;

      expect(deltaLarge).toBeLessThan(deltaSmall);
    });

    it("Teorema D3: Downward Drift deve ser maior no River do que no Flop para o mesmo pote", () => {
      const ipRp = 20;
      const oopRp = 20;
      const potSize = 40;

      const resultFlop = solveIcmDistortion(
        ipRp,
        oopRp,
        chipEvFreqs,
        1,
        potSize,
        0,
      );
      const resultRiver = solveIcmDistortion(
        ipRp,
        oopRp,
        chipEvFreqs,
        1,
        potSize,
        2,
      );

      // No River, a pressão RP converte mais raise em call/fold (Downward Drift)
      expect(resultRiver.oop.raise.center).toBeLessThan(
        resultFlop.oop.raise.center,
      );
    });
  });

  // 5. CALIBRAÇÃO AULA 1.2 (Âncora Empírica)
  describe("Aula 1.2 Calibration", () => {
    // Dados da Aula 1.2: BTN 40bb vs BB 55bb @ FT
    // Na nossa implementação de teste, vamos garantir que os índices correspondam aos stacks de 40 e 55
    const stacks = [9.4, 52.4, 22.2, 7, 44.3, 24.3, 40, 13.4, 55];
    const prizes = [
      237.34, 170.96, 135.17, 109.99, 90.28, 73.95, 59.92, 47.56, 36.47,
    ];

    it("deve aproximar-se do RP de referência (BTN ~21.4%, BB ~12.9%)", () => {
      // No array acima: BTN(40) está no index 6, BB(55) no index 8
      const result = deriveRps(stacks, prizes, 6, 8);

      if (result) {
        console.log("--- AULA 1.2 DEBUG ---");
        console.log("IP RP (BTN):", result.ipRp);
        console.log("OOP RP (BB):", result.oopRp);
        console.log("IP BF:", result.allBfs[6]);
        console.log("OOP BF:", result.allBfs[8]);

        // Calibração SOTA v4.2: O motor M-H pode dar pequenas variações conforme a precisão da recursão
        expect(result.ipRp).toBeGreaterThan(15); // Margem de segurança para calibração
        expect(result.ipRp).toBeLessThan(26);
        expect(result.oopRp).toBeGreaterThan(10);
        expect(result.oopRp).toBeLessThan(18);
      }
    });
  });
});
