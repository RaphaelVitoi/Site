"use client";

import React from 'react';

interface Props {
    riskPremium: number; setRiskPremium: (v: number) => void;
    potSize: number; setPotSize: (v: number) => void;
    betSize: number; setBetSize: (v: number) => void;
    pkoValue: number; setPkoValue: (v: number) => void;
    heroStack: number; setHeroStack: (v: number) => void;
    villainStack: number; setVillainStack: (v: number) => void;
}

export default function ControlPanel({ riskPremium, setRiskPremium, potSize, setPotSize, betSize, setBetSize, heroStack, setHeroStack, villainStack, setVillainStack }: Props) {
    const controls = React.useMemo(() => [
        { label: 'Risk Premium (RP)', value: riskPremium, setter: setRiskPremium, min: 0, max: 0.5, step: 0.01, display: `${(riskPremium * 100).toFixed(1)}%` },
        { label: 'Pot Size (BBs)', value: potSize, setter: setPotSize, min: 1, max: 200, step: 1, display: potSize },
        { label: 'Bet Size enfrentada (BBs)', value: betSize, setter: setBetSize, min: 1, max: 200, step: 1, display: betSize },
        { label: 'Hero Stack (BBs)', value: heroStack, setter: setHeroStack, min: 1, max: 100, step: 1, display: heroStack },
        { label: 'Villain Stack (BBs)', value: villainStack, setter: setVillainStack, min: 1, max: 100, step: 1, display: villainStack },
        { label: 'PKO Value (BBs)', value: pkoValue, setter: setPkoValue, min: 0, max: 50, step: 1, display: pkoValue },
    ];
}, [riskPremium, potSize, betSize, heroStack, villainStack, pkoValue]);

return (
    <div className="space-y-6 bg-slate-800/30 p-5 rounded-xl border border-white/5">
        <h3 className="text-lg font-semibold text-slate-300 border-b border-white/10 pb-2">Variáveis Táticas</h3>

        {controls.map((control, idx) => (
            <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">{control.label}</span>
                    <span className="font-mono text-cyan-400">{control.display}</span>
                </div>
                <input type="range" min={control.min} max={control.max} step={control.step} value={control.value} onChange={(e) => control.setter(parseFloat(e.target.value))} className="w-full accent-blue-500" />
            </div>
        ))}
    </div>
);
}