import { EB_Garamond, Playfair_Display } from 'next/font/google';
import type React from 'react';

const playfair = Playfair_Display({
	subsets: ['latin'],
	variable: '--font-playfair',
	display: 'swap',
});

const ebGaramond = EB_Garamond({
	subsets: ['latin'],
	variable: '--font-garamond',
	display: 'swap',
});

/**
 * Escopa as fontes serifadas editoriais (Playfair Display e EB Garamond) exclusivamente
 * ao grupo `(public)` (Home, Biblioteca, Aulas, Manifesto), poupando banda em rotas
 * laboratoriais e operacionais (`/simulador`, `/dashboard`, `/templo`).
 */
export default function PublicEditorialLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <div className={`${playfair.variable} ${ebGaramond.variable} contents`}>{children}</div>;
}
