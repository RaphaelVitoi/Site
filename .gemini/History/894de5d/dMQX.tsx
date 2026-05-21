'use client';

import { FaLinkedinIn, FaTwitter, FaWhatsapp } from 'react-icons/fa';
import styles from './ShareButtons.module.css';

interface ShareButtonsProps {
    title: string;
    url: string;
}

export default function ShareButtons ( { title, url }: Readonly<ShareButtonsProps> ) {
    const encodedTitle = encodeURIComponent( title );
    const encodedUrl = encodeURIComponent( url );

    const socialLinks = [
        {
            name: 'Twitter',
            href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
            icon: <FaTwitter />,
            className: styles.twitter,
        },
        {
            name: 'LinkedIn',
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            icon: <FaLinkedinIn />,
            className: styles.linkedin,
        },
        {
            name: 'WhatsApp',
            href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
            icon: <FaWhatsapp />,
            className: styles.whatsapp,
        },
    ];

    return (
        <div className={ styles.shareContainer }>
            <h4 className={ styles.shareTitle }>Compartilhe o Conhecimento</h4>
            <div className={ styles.buttonsWrapper }>
                { socialLinks.map( ( link ) => (
                    <a key={ link.name } href={ link.href } target="_blank" rel="noopener noreferrer" className={ `${styles.button} ${link.className}` } aria-label={ `Compartilhar no ${link.name}` }>
                        { link.icon }
                    </a>
                ) ) }
            </div>
        </div>
    );
}
