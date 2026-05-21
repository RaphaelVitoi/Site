'use client';

import { useState, useMemo } from 'react';
import styles from './ResurrectionRiskSimulator.module.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

// Simplified ICM valuation function (example, not a real ICM model)
const getIcmValue = (stack: number, totalChips: number) => {
    // This is a placeholder. A real model would be much more complex.
    // For this simulation, we can use a simple power function to show non-linearity.
    return Math.pow(stack / totalChips, 0.7);
};

export default function ResurrectionRiskSimulator() {
    const [clStack, setClStack] = useState(100);
    const [ssStack, setSsStack] = useState(10);
    const [msStack, setMsStack] = useState(30); // Middle Stack
    const [equity, setEquity] = useState(58); // CL's equity vs SS range

    const {
        potToWin,
        costToCall,
        chipEv,
        clStackWin,
        clStackLoss,
        ssStackWin,
        msEvWin,
        msEvLoss,
        msEvFold,
        futureEvWin,
        futureEvLoss,
        netFutureEv,
        foldFutureEv,
        decision,
        chartData,
        breakEvenEquity,
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
        const totalChips = clStack + ssStack + msStack;
        const edgeFactorDeep = 1.2; // CL's ability to leverage a huge stack
        const edgeFactorMedium = 1.0; // CL's edge is neutralized when stacks are closer

        const baseFutureEvWin = getIcmValue(clStackWin, totalChips);
        const baseFutureEvLoss = getIcmValue(clStackLoss, totalChips);

        const futureEvWinVal = baseFutureEvWin * edgeFactorDeep;
        const futureEvLossVal = baseFutureEvLoss * edgeFactorMedium;

        const netFutureEv = (equity / 100) * futureEvWinVal + ((100 - equity) / 100) * futureEvLossVal;
        const foldFutureEv = getIcmValue(clStack - bb, totalChips) * edgeFactorDeep;

        // Middle Stack EV Impact
        const msEvWin = getIcmValue(msStack, totalChips - ssStack); // SS busts
        const msEvLoss = getIcmValue(msStack, totalChips); // CL doubles SS
        const msEvFold = getIcmValue(msStack, totalChips - bb); // CL folds, pot is smaller

        const decision = netFutureEv > foldFutureEv;

        // Chart Data Generation
        const data = [];
        let breakEvenEquity: number | null = null;

        for (let i = 45; i <= 70; i++) {
            const currentEquity = i;
            // Recalculate netFutureEv for the current equity point in the loop
            const currentNetFutureEv = (currentEquity / 100) * futureEvWinVal + ((100 - currentEquity) / 100) * futureEvLossVal;

            if (breakEvenEquity === null && currentNetFutureEv > foldFutureEv) {
                // Simple interpolation to find the crossover point
                const prevNetFutureEv = ((i - 1) / 100) * futureEvWinVal + ((100 - (i - 1)) / 100) * futureEvLossVal;
                const slope = currentNetFutureEv - prevNetFutureEv;
                if (slope > 0) {
                    breakEvenEquity = (i - 1) + (foldFutureEv - prevNetFutureEv) / slope;
                }
            }

            data.push({
                equity: currentEquity,
                "EV (Call)": parseFloat(currentNetFutureEv.toFixed(4)),
                "EV (Fold)": parseFloat(foldFutureEv.toFixed(4)),
            });
        }

        return {
            potToWin,
            costToCall,
            chipEv,
            clStackWin,
            clStackLoss,
            ssStackWin,
            msEvWin,
            msEvLoss,
            msEvFold,
            futureEvWin: futureEvWinVal,
            futureEvLoss: futureEvLossVal,
            netFutureEv,
            foldFutureEv,
            decision,
            chartData: data,
            breakEvenEquity,
        };
    }, [clStack, ssStack, equity]);
}, [clStack, ssStack, msStack, equity]);

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
                <label htmlFor="msStack">Stack do Middle Stack (MS): {msStack}bb</label>
                <input type="range" id="msStack" min="20" max="50" value={msStack} onChange={(e) => setMsStack(Number(e.target.value))} />
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

            <div className={`${styles.resultCard} ${styles.fullSpan}`}>
                <h4>Impacto Sistêmico (Middle Stack)</h4>
                <p>O Middle Stack (MS) é um espectador, mas sua perspectiva muda drasticamente com o resultado.</p>
                <div className={styles.scenarioColumns}>
                    <p>EV (Perspectiva) do MS se CL <strong>vence</strong>: <strong className={styles.positive}>{msEvWin.toFixed(3)}</strong> (melhor para ele)</p>
                    <p>EV (Perspectiva) do MS se CL <strong>perde</strong>: <strong className={styles.negative}>{msEvLoss.toFixed(3)}</strong> (pior para ele)</p>
                    <p>EV (Perspectiva) do MS se CL <strong>folda</strong>: <strong>{msEvFold.toFixed(3)}</strong> (baseline)</p>
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

        <div className={styles.chartContainer}>
            <h4 className={styles.chartTitle}>Análise Visual: Ponto de Inflexão da Decisão</h4>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart
                    data={chartData}
                    margin={{
                        top: 5, right: 20, left: -10, bottom: 15,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="equity" unit="%" tick={{ fontSize: 12 }} label={{ value: 'Equidade do CL', position: 'insideBottom', offset: -10 }} />
                    <YAxis domain={['dataMin - 0.01', 'dataMax + 0.01']} tickFormatter={(tick) => tick.toFixed(3)} tick={{ fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#222', border: '1px solid #444' }}
                        labelStyle={{ color: '#eee', fontWeight: 'bold' }}
                        formatter={(value: number, name: string) => [value.toFixed(4), name]}
                        labelFormatter={(label) => `Equidade: ${label}%`}
                    />
                    <Legend wrapperStyle={{ fontSize: '14px' }} />
                    {breakEvenEquity !== null && (
                        <ReferenceLine x={breakEvenEquity} stroke="#f59e0b" strokeDasharray="4 4">
                            <label value={`Ponto de Inflexão (${breakEvenEquity.toFixed(1)}%)`} position="insideTop" fill="#f59e0b" fontSize={12} />
                        </ReferenceLine>
                    )}
                    <Line type="monotone" name="EV Perspectiva (Call)" dataKey="EV (Call)" stroke="#4caf50" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                    <Line type="monotone" name="EV Perspectiva (Fold)" dataKey="EV (Fold)" stroke="#f44336" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
);
}