'use client';
import styles from './InfoTooltip.module.css';

interface InfoTooltipProps {
    text: string;
}

export default function InfoTooltip ( { text }: Readonly<InfoTooltipProps> ) {
    return (
        <div className={ styles.tooltipContainer }>
            <span className={ styles.tooltipIcon }>?</span>
            <div className={ styles.tooltipText }>{ text }</div>
        </div>
    );
}
