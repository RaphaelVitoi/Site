'use client';

import { useState, useMemo } from 'react';
import styles from './ResurrectionRiskSimulator.module.css';

// Simplified ICM valuation function (example, not a real ICM model)
const getIcmValue = (stack: number, totalChips: number) => {
    // This is a placeholder. A real model would be much more complex.
    // For this simulation, we can use a simple power function to show non-linearity.
    return Math.pow(stack / totalChips, 0.7);
};

export default function ResurrectionRiskSimulator() {
    const [clStack, setClStack] = useState(100);
    const [ssStack, setSsStack] = useState(10);
    const [equity, setEquity] = useState(58); // CL's equity vs SS range

    const {
        potToWin,
        costToCall,
        chipEv,
        clStackWin,
        clStackLoss,
        ssStackWin,
        futureEvWin,
        futureEvLoss,
        netFutureEv,
        foldFutureEv,
        decision,
    } = useMemo(() => {
        const bb = 1;
        const costToCall = ssStack - bb;
        const potToWin = ssStack + bb;

        // ChipEV Calculation
        const evWin = (equity / 100) * potToWin;
        const evLoss = ((100 - equity) / 100) * -costToCall;
        const chipEv = evWin + evLoss;

        // Future State Stacks
        const clStackWin = clStack + ssStack;
        const clStackLoss = clStack - ssStack;
        const ssStackWin = ssStack * 2;

        // Future EV (FGS) Model - The core of the simulation
        const totalChips = 160; // Assume a total chip count for the FT
        const edgeFactorDeep = 1.2; // CL's ability to leverage a huge stack
        const edgeFactorMedium = 1.0; // CL's edge is neutralized when stacks are closer

        const baseFutureEvWin = getIcmValue(clStackWin, totalChips);
        const baseFutureEvLoss = getIcmValue(clStackLoss, totalChips);

        const futureEvWinVal = baseFutureEvWin * edgeFactorDeep;
        const futureEvLossVal = baseFutureEvLoss * edgeFactorMedium;

        const netFutureEv = (equity / 100) * futureEvWinVal + ((100 - equity) / 100) * futureEvLossVal;
        const foldFutureEv = getIcmValue(clStack - bb, totalChips) * edgeFactorDeep;

        const decision = netFutureEv > foldFutureEv;

        return {
            potToWin,
            costToCall,
            chipEv,
            clStackWin,
            clStackLoss,
            ssStackWin,
            futureEvWin: futureEvWinVal,
            futureEvLoss: futureEvLossVal,
            netFutureEv,
            foldFutureEv,
            decision,
        };
    }, [clStack, ssStack, equity]);

    return (
        <div className={styles.simulator}>
            <h3 className="article-title">Simulador Interativo: O Risco da Ressurreição</h3>
            <p>Ajuste os parâmetros para visualizar como um call marginalmente lucrativo em ChipEV pode ser um desastre estratégico em termos de EV Futuro (Perspectiva Matemática).</p>

            <div className={styles.controls}>
                <div className={styles.control}>
                    <label htmlFor="clStack">Stack do Chip Leader (CL): {clStack}bb</label>
                    <input type="range" id="clStack" min="50" max="200" value={clStack} onChange={(e) => setClStack(Number(e.target.value))} />
                </div>
                <div className={styles.control}>
                    <label htmlFor="ssStack">Stack do Short Stack (SS): {ssStack}bb</label>
                    <input type="range" id="ssStack" min="5" max="25" value={ssStack} onChange={(e) => setSsStack(Number(e.target.value))} />
                </div>
                <div className={styles.control}>
                    <label htmlFor="equity">Equidade do CL vs. Range do SS: {equity}%</label>
                    <input type="range" id="equity" min="45" max="70" value={equity} onChange={(e) => setEquity(Number(e.target.value))} />
                </div>
            </div>

            <div className={styles.results}>
                <div className={styles.resultCard}>
                    <h4>Análise de ChipEV (Curto Prazo)</h4>
                    <p>Custo do Call: <strong>{costToCall.toFixed(2)} bb</strong></p>
                    <p>Pote a Ganhar: <strong>{potToWin.toFixed(2)} bb</strong></p>
                    <p className={chipEv > 0 ? styles.positive : styles.negative}>
                        EV do Call: <strong>{chipEv.toFixed(2)} bb</strong>
                    </p>
                    <p className="small-text">Um call com ChipEV positivo parece bom, mas ignora o impacto no ecossistema da mesa.</p>
                </div>

                <div className={styles.resultCard}>
                    <h4>Análise de Perspectiva (Longo Prazo)</h4>
                    <div className={styles.scenario}>
                        <h5>Cenário 1: CL Vence</h5>
                        <p>Stack Final do CL: <strong>{clStackWin.toFixed(2)} bb</strong></p>
                        <p>SS é eliminado.</p>
                        <p className={styles.positive}>EV Futuro (Perspectiva): <strong>{futureEvWin.toFixed(3)}</strong></p>
                    </div>
                    <div className={styles.scenario}>
                        <h5>Cenário 2: CL Perde</h5>
                        <p>Stack Final do CL: <strong>{clStackLoss.toFixed(2)} bb</strong></p>
                        <p>Stack do SS (Ressuscitado): <strong>{ssStackWin.toFixed(2)} bb</strong></p>
                        <p className={styles.negative}>EV Futuro (Perspectiva): <strong>{futureEvLoss.toFixed(3)}</strong></p>
                    </div>
                </div>
            </div>

            <div className={styles.conclusion}>
                <h4>Conclusão da Perspectiva Matemática</h4>
                <p>EV (Perspectiva) do Fold: <strong>{(foldFutureEv).toFixed(3)}</strong></p>
                <p>EV (Perspectiva) do Call: <strong className={netFutureEv > foldFutureEv ? styles.positive : styles.negative}>{netFutureEv.toFixed(3)}</strong></p>
                <div className={decision ? styles.call : styles.fold}>
                    {decision ? (
                        <span><strong>Decisão Sólida:</strong> O call é justificado mesmo considerando o risco sistêmico.</span>
                    ) : (
                        <span><strong>Decisão Sólida:</strong> O fold é superior. O ganho em ChipEV não compensa a destruição da sua edge futura e o risco de "ressuscitar" um oponente.</span>
                    )}
                </div>
            </div>
        </div>
    );
}