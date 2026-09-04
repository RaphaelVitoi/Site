'use client';

import React from 'react';
import { SotaTooltip } from './SotaTooltip';

interface InfoTooltipProps {
	text: string;
	title?: string;
}

export const InfoTooltip = ({
	text,
	title = 'Parâmetro GTO',
}: Readonly<InfoTooltipProps>): React.JSX.Element => {
	return (
		<SotaTooltip title={title} content={text} theme="indigo">
			<span
				className="cursor-help ml-1 inline-flex items-center text-text-darker hover:text-accent-indigo transition-colors"
				style={{ fontSize: '0.65rem', lineHeight: 1 }}
				aria-label={text}
			>
				ⓘ
			</span>
		</SotaTooltip>
	);
};
