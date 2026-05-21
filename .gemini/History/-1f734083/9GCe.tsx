import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface IcmChartsProps {
  totalFounderShares: number;
  investorShares: number;
  optionPoolShares: number;
}

const COLORS = ['#06b6d4', '#d946ef', '#8b5cf6', '#10b981']; // Cyan, Magenta, Violet, Emerald

export default function IcmCharts({ totalFounderShares, investorShares, optionPoolShares }: IcmChartsProps) {
  const data = [
    { name: 'Fundadores', value: totalFounderShares },
    { name: 'Investidores', value: investorShares },
    { name: 'Option Pool', value: optionPoolShares },
  ];

  return (
    <div className="bg-zinc-900 p-4 rounded border border-zinc-800 h-64 sm:h-80 flex flex-col">
      <h3 className="text-lg font-semibold text-zinc-200 mb-4">Distribuição do Cap Table</h3>
      <div className="flex-1 w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 0 }) + ' ações'} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}