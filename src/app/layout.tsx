import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { siteConfig } from '@/constants';

// Configuração da fonte Inter
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [
    {
      name: siteConfig.name,
      url: siteConfig.url,
    },
  ],
  creator: siteConfig.name,
  // Configuração completa de favicons - ICO da pasta images
  icons: {
    icon: [
      { url: '/images/favicon.ico', sizes: 'any' },
      { url: '/images/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/images/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
    ],
    apple: [
      { url: '/images/favicon.ico', sizes: '180x180', type: 'image/x-icon' },
    ],
    shortcut: '/images/favicon.ico',
  },
  // Configuração do manifest (PWA)
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    creator: '@paulasouzasp',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Meta tags adicionais para SEO
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: '/',
  },
  // Theme color para mobile
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#1d4ed8' },
  ],
  // Configuração para iOS
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: siteConfig.name,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} scroll-smooth`}>
      <head>
        {/* Favicon adicional para garantir compatibilidade */}
        <link rel="icon" href="/images/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/images/favicon.ico" type="image/x-icon" />
        
        {/* Meta tags adicionais que não estão no metadata */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen flex flex-col overflow-x-hidden">
        <Header />
        <div className="flex-1 layout-container">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}