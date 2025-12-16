/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@supabase/supabase-js': require.resolve('@supabase/supabase-js'),
    };
    return config;
  },
}

module.exports = nextConfig

