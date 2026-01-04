import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './app/components/**/*.{ts,tsx}',
    './app/lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {}
  },
  plugins: []
};

export default config;
