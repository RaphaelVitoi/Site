import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          sky: 'var(--accent-sky)',
          rose: 'var(--accent-rose)',
          indigo: 'var(--accent-indigo)',
          emerald: 'var(--accent-emerald)',
          amber: 'var(--accent-amber)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        signature: ['Great Vibes', 'cursive'],
      },
      transitionTimingFunction: {
        'master': 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
};

export default config;
