'use client';

interface MetricRowProps {
	label: string;
	value: string;
	colorClass: string;
	loading?: boolean;
	tooltipDesc?: string;
	isAlert?: boolean;
	alertType?: 'warning' | 'danger' | 'info';
}

export const MetricRow = ({
	label,
	value,
	colorClass,
	loading,
	tooltipDesc,
	isAlert,
	alertType = 'warning',
}: Readonly<MetricRowProps>) => {
	const getAlertClasses = () => {
		if (!isAlert) return '';
		switch (alertType) {
			case 'danger':
				return 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)] animate-pulse';
			case 'warning':
				return 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]';
			case 'info':
				return 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]';
			default:
				return '';
		}
	};

	const getTextColorClass = () => {
		if (loading) return 'text-text-darker';
		if (isAlert) return 'text-white';
		return colorClass;
	};

	return (
		<div
			className={`flex flex-col py-2 px-3 rounded-xl border border-transparent transition-all duration-300 ${
				isAlert ? `${getAlertClasses()} my-1` : 'border-b border-white/5 last:border-0'
			}`}
		>
			<div className="flex justify-between items-center gap-4">
				<span className="text-[0.6rem] font-black uppercase tracking-widest text-text-dim cursor-default flex items-center gap-1.5">
					{isAlert && (
						<span className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
					)}
					{label}
				</span>
				<span
					className={`text-[0.7rem] font-black font-mono text-right ${getTextColorClass()}`}
				>
					{loading ? '...' : value}
				</span>
			</div>
			{tooltipDesc && (
				<p className="text-[0.45rem] text-text-darker leading-normal m-0 mt-1 uppercase tracking-widest">
					{tooltipDesc}
				</p>
			)}
		</div>
	);
};
