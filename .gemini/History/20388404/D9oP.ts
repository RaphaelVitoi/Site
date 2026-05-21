import { useState } from 'react';

export interface Shareholder {
    id: string;
    name: string;
    shares: number;
}

export function useIcmSimulation() {
    const [preMoney, setPreMoney] = useState<number>(10000000); // 10M R$ Default
    const [investment, setInvestment] = useState<number>(2000000); // 2M R$ Default
    const [optionPoolPercent, setOptionPoolPercent] = useState<number>(10); // 10% Default

    const [founders, setFounders] = useState<Shareholder[]>([
        { id: '1', name: 'Fundador A', shares: 600000 },
        { id: '2', name: 'Fundador B', shares: 400000 },
    ]);

    const totalFounderShares = founders.reduce((sum, f) => sum + f.shares, 0);

    // Cálculos do Cap Table (Valuation e Distribuição de Equity)
    const postMoney = preMoney + investment;
    const investorPercent = postMoney > 0 ? investment / postMoney : 0;
    const poolPercent = optionPoolPercent / 100;

    // Ações dos fundadores representam o que sobrou após Investidores e Option Pool
    const founderPercent = 1 - investorPercent - poolPercent;
    const safeFounderPercent = Math.max(0.0001, founderPercent); // Previne divisão por zero ou negativa

    const totalSharesPostInvestment = totalFounderShares > 0 ? totalFounderShares / safeFounderPercent : 0;

    const investorShares = totalSharesPostInvestment * investorPercent;
    const optionPoolShares = totalSharesPostInvestment * poolPercent;
    const pricePerShare = totalSharesPostInvestment > 0 ? postMoney / totalSharesPostInvestment : 0;

    return {
        preMoney, setPreMoney,
        investment, setInvestment,
        optionPoolPercent, setOptionPoolPercent,
        postMoney, pricePerShare,
        totalFounderShares, investorShares, optionPoolShares,
        founders, setFounders, totalSharesPostInvestment
    };
}