import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography'; // Import the plugin

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Adicione suas cores personalizadas aqui se ainda não as tiver
      // Exemplo:
      // colors: {
      //   'accent-emerald': 'var(--accent-emerald)',
      //   'accent-secondary': 'var(--accent-secondary)',
      //   'text-main': 'var(--text-main)',
      //   'glass-border': 'var(--glass-border)',
      // },
      typography: ({ theme }) => ({
        invert: { // Esta configuração se aplica quando você usa `prose-invert`
          css: {
            // Estilização para blockquote
            blockquote: {
              color: 'var(--text-main)', // Mantém o texto legível
              borderLeftColor: 'var(--accent-emerald)', // Cor da borda esquerda com accent-emerald
              borderLeftWidth: '4px',
              paddingLeft: '1.2em',
              fontStyle: 'italic',
              fontWeight: '500',
              quotes: '"\\201C""\\201D""\\2018""\\2019"', // Adiciona aspas tipográficas
              '& p:first-of-type::before': {
                content: 'open-quote',
              },
              '& p:last-of-type::after': {
                content: 'close-quote',
              },
            },
            // Estilização para tabelas
            table: {
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              marginTop: '1.5em',
              marginBottom: '1.5em',
              fontSize: theme('fontSize.base'), // Ajusta o tamanho da fonte da tabela
              lineHeight: theme('lineHeight.normal'),
              color: 'var(--text-main)',
              borderColor: 'var(--glass-border)', // Borda da tabela com glass-border
              'thead': {
                backgroundColor: 'var(--accent-secondary)', // Fundo do cabeçalho da tabela com accent-secondary
                color: theme('colors.white'), // Texto do cabeçalho branco
                borderBottomColor: 'var(--glass-border)',
              },
              'th': {
                padding: theme('spacing.3') + ' ' + theme('spacing.4'),
                fontWeight: theme('fontWeight.semibold'),
              },
              'td': {
                padding: theme('spacing.3') + ' ' + theme('spacing.4'),
                borderBottomColor: 'var(--glass-border)',
              },
              'tbody tr:last-child': {
                'td': {
                  borderBottomWidth: '0',
                },
              },
            },
          },
        },
      }),
    },
  },
  plugins: [
    typography, // Use the imported plugin
  ],
};

export default config;