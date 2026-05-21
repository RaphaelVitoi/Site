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
            // Estilização para imagens
            img: {
              borderRadius: theme('borderRadius.lg'), // Bordas arredondadas
              maxWidth: '100%', // Garante responsividade
              height: 'auto', // Mantém a proporção
              display: 'block', // Centraliza a imagem
              marginLeft: 'auto',
              marginRight: 'auto',
              marginTop: theme('spacing.8'), // Espaçamento superior
              marginBottom: theme('spacing.8'), // Espaçamento inferior
              boxShadow: theme('boxShadow.lg'), // Sombra sutil para destaque
            },
            // Estilização para links
            a: {
              color: 'var(--accent-emerald)', // Cor dos links
              fontWeight: theme('fontWeight.medium'),
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
                color: 'var(--accent-secondary)', // Cor no hover
              },
            },
            // Estilização para código inline
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            code: {
              backgroundColor: 'rgba(99,102,241,0.1)', // Fundo sutil para código inline
              color: 'var(--accent-emerald)',
              borderRadius: theme('borderRadius.md'),
              padding: '0.2em 0.4em',
              fontWeight: theme('fontWeight.normal'),
            },
            // Estilização para blocos de código
            'pre': {
              backgroundColor: theme('colors.gray.800'), // Fundo escuro para blocos de código
              color: theme('colors.gray.100'),
              borderRadius: theme('borderRadius.lg'),
              padding: theme('spacing.4'),
              overflowX: 'auto', // Garante scroll horizontal para código longo
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