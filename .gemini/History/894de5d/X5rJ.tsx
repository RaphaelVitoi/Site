import React from 'react';
import { FaTwitter, FaLinkedinIn } from 'react-icons/fa'; // Certifique-se de ter react-icons instalado

interface ShareButtonsProps {
    title: string;
    url: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ title, url }) => {
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    const linkedinShareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;

    return (
        <div className="flex items-center justify-center space-x-4 mt-12 pt-8 border-t border-white/10">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Compartilhar:</span>
            <a
                href={twitterShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200"
                aria-label="Compartilhar no Twitter"
            >
                <FaTwitter className="text-lg" />
            </a>
            <a
                href={linkedinShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-700 hover:bg-blue-800 text-white transition-colors duration-200"
                aria-label="Compartilhar no LinkedIn"
            >
                <FaLinkedinIn className="text-lg" />
            </a>
        </div>
    );
};

export default ShareButtons;