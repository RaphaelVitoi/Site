import { useState, useMemo } from 'react';

export interface Shareholder {
  id: string;
  name: string;
  shares: number;
}

export function useIcmSimulation() {
  const [preMoney, setPreMoney] = useState<number>(5000000);
  const [investment, setInvestment] = useState<number>(1000000);
  const [optionPoolPercent, setOptionPoolPercent] = useState<number>(10);
  
  const [founders, setFounders] = useState<Shareholder[]>([
    { id: '1', name: 'Fundador A', shares: 1000000 },
    { id: '2', name: 'Fundador B', shares: 1000000 },
  ]);

  const postMoney = useMemo(() => preMoney + investment, [preMoney, investment]);
  
  const totalFounderShares = useMemo(() => founders.reduce((acc, curr) => acc + curr.shares, 0), [founders]);
  
  const pricePerShare = useMemo(() => preMoney / totalFounderShares, [preMoney, totalFounderShares]);

  const investorShares = useMemo(() => investment / pricePerShare, [investment, pricePerShare]);

  const totalSharesPostInvestment = totalFounderShares + investorShares;

  return {
    preMoney,
    setPreMoney,
    investment,
    setInvestment,
    optionPoolPercent,
    setOptionPoolPercent,
    postMoney,
    pricePerShare,
    founders,
    totalFounderShares,
    investorShares,
    totalSharesPostInvestment
  };
}