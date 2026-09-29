'use client';

import { FaLinkedinIn, FaTwitter, FaWhatsapp } from 'react-icons/fa';
import styles from './ShareButtons.module.css';

interface ShareButtonsProps {
	title: string;
	url: string;
	/**
	 * Nivel do titulo, de 2 a 6. MEDIDO EM 2026-09-29: o componente usava
	 * `h4` fixo, o que reprovava `heading-order` nas paginas que terminam em
	 * `h2`. O padrao e `3` porque e o nivel mais comum depois de um `h2` em
	 * documento editorial; quem compoe pode sobrescrever.
	 */
	headingLevel?: 2 | 3 | 4 | 5 | 6;
}

export default function ShareButtons({
	title,
	url,
	headingLevel = 3,
}: Readonly<ShareButtonsProps>) {
	const Tag = `h${headingLevel}` as const;
	const encodedTitle = encodeURIComponent(title);
	const encodedUrl = encodeURIComponent(url);

	const socialLinks = [
		{
			name: 'Twitter',
			href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
			icon: <FaTwitter />,
			className: styles['twitter'],
		},
		{
			name: 'LinkedIn',
			href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
			icon: <FaLinkedinIn />,
			className: styles['linkedin'],
		},
		{
			name: 'WhatsApp',
			href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
			icon: <FaWhatsapp />,
			className: styles['whatsapp'],
		},
	];

	return (
		<div className={styles['shareContainer']}>
			{/*
			 * MEDIDO EM 2026-09-29: este `h4` reprovava `heading-order` em
			 * /aulas/leitura-icm e /biblioteca/estado-da-arte, porque as duas
			 * paginas terminam em `h2` e o componente impunha `h4` — salto de
			 * dois niveis. Nao havia `h3` para ele herdar.
			 *
			 * Endurecer o nivel nao resolve: o defeito e do COMUM, nao da
			 * pagina. A pagina seguinte pode terminar em `h3`, e o salto
			 * reaparece. Por isso o nivel chega por prop, com `3` como
			 * padrao, e quem compoe diz em que nivel esta.
			 *
			 * A prop e o nivel INTEIRO de 2 a 6, e nao um boolean: um
			 * widget compartilhado usado em dois templates de documento
			 * precisa dos dois, e um interruptor `asHeading` so resolveria
			 * um deles.
			 */}
			<Tag className={styles['shareTitle']}>Compartilhe o Conhecimento</Tag>
			<div className={styles['buttonsWrapper']}>
				{socialLinks.map((link) => (
					<a
						key={link.name}
						href={link.href}
						target="_blank"
						rel="noopener noreferrer"
						className={`${styles['button']} ${link.className}`}
						aria-label={`Compartilhar no ${link.name}`}
					>
						{link.icon}
					</a>
				))}
			</div>
		</div>
	);
}
