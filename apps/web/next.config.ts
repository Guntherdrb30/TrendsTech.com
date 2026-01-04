import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@trends172tech/db', '@trends172tech/core', '@trends172tech/openai']
};

export default withNextIntl(nextConfig);
