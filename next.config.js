/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'], // Mantenha se ainda precisar
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co', // O curinga '*' permite qualquer subdomínio do supabase.co
        port: '',
        pathname: '/storage/v1/object/public/**', // Ajuste o caminho conforme necessário
      },
    ],
  },
};

module.exports = nextConfig;