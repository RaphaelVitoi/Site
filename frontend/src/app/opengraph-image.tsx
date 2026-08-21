/**
 * OG Image Gerada Automaticamente pelo Next.js
 * PATH: src/app/opengraph-image.tsx
 * ROLE: Gera og:image para todas as páginas via ImageResponse API
 * DIMENSÃO: 1200x630px (padrão social)
 */
import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'PokerRacional — Raphael Vitoi';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const containerStyle = {
	width: '1200px',
	height: '630px',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	background: 'linear-gradient(135deg, #020617 0%, #0f172a 40%, #1e1b4b 100%)',
	position: 'relative',
	overflow: 'hidden',
} as const;
const gridStyle = {
	position: 'absolute',
	inset: 0,
	backgroundImage:
		'linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px)',
	backgroundSize: '60px 60px',
} as const;
const glow1Style = {
	position: 'absolute',
	top: '-100px',
	left: '-100px',
	width: '500px',
	height: '500px',
	background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
	borderRadius: '50%',
} as const;
const glow2Style = {
	position: 'absolute',
	bottom: '-100px',
	right: '-100px',
	width: '400px',
	height: '400px',
	background: 'radial-gradient(circle, rgba(225,29,72,0.2) 0%, transparent 70%)',
	borderRadius: '50%',
} as const;
const contentStyle = {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	gap: '24px',
	position: 'relative',
	padding: '48px',
	textAlign: 'center',
} as const;
const labelStyle = {
	display: 'flex',
	alignItems: 'center',
	gap: '8px',
	background: 'rgba(99,102,241,0.15)',
	border: '1px solid rgba(99,102,241,0.3)',
	borderRadius: '999px',
	padding: '6px 20px',
	fontSize: '14px',
	fontWeight: 600,
	color: '#a5b4fc',
	letterSpacing: '0.1em',
	textTransform: 'uppercase',
} as const;
const logoStyle = {
	fontSize: '72px',
	fontWeight: 900,
	lineHeight: 1.1,
	background: 'linear-gradient(135deg, #ffffff 0%, #c7d2fe 50%, #fda4af 100%)',
	backgroundClip: 'text',
	color: 'transparent',
	letterSpacing: '-2px',
	display: 'flex',
} as const;
const taglineStyle = {
	fontSize: '24px',
	fontWeight: 400,
	color: '#94a3b8',
	lineHeight: 1.4,
	maxWidth: '700px',
} as const;
const authorWrapperStyle = {
	display: 'flex',
	alignItems: 'center',
	gap: '12px',
	marginTop: '8px',
} as const;
const authorLineStyle = {
	width: '2px',
	height: '24px',
	background: 'linear-gradient(180deg, #6366f1, #e11d48)',
} as const;
const authorTextStyle = {
	fontSize: '16px',
	fontWeight: 600,
	color: '#e2e8f0',
	letterSpacing: '0.05em',
} as const;

const LABEL_TEXT = 'ICM \u2022 Risk Premium \u2022 Pós-Flop';
const LOGO_TEXT = 'PokerRacional';
const TAGLINE_TEXT = 'A Geometria do Risco: ICM Pós-Flop, Risk Premium e a Nova Fronteira do Edge em 2026';
const AUTHOR_TEXT = 'Raphael Vitoi \u2014 Embaixador DeepSolver \u2022 GTO Wizard';

export default async function Image() {
	return new ImageResponse(
		<div style={containerStyle}>
			{/* Grade decorativa */}
			<div style={gridStyle} />

			{/* Glows */}
			<div style={glow1Style} />
			<div style={glow2Style} />

			{/* Conteúdo */}
			<div style={contentStyle}>
				{/* Label */}
				<div style={labelStyle}>{LABEL_TEXT}</div>

				{/* Logo */}
				<div style={logoStyle}>{LOGO_TEXT}</div>

				{/* Tagline */}
				<div style={taglineStyle}>{TAGLINE_TEXT}</div>

				{/* Author */}
				<div style={authorWrapperStyle}>
					<div style={authorLineStyle} />
					<div style={authorTextStyle}>{AUTHOR_TEXT}</div>
				</div>
			</div>
		</div>,
		{ width: 1200, height: 630 },
	);
}
