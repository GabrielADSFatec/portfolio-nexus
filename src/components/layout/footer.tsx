// components/layout/footer.tsx
import Link from 'next/link';
import { Github, Linkedin, Mail, Heart } from 'lucide-react';
import { siteConfig } from '@/constants';
import { cn } from '@/lib/utils';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      href: 'https://github.com/seuusuario',
      Icon: Github,
      title: 'GitHub',
    },
    {
      href: 'https://linkedin.com/in/seuusuario',
      Icon: Linkedin,
      title: 'LinkedIn',
    },
    {
      href: 'mailto:contato@seusite.com',
      Icon: Mail,
      title: 'Email',
    },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-neutral-900 via-primary-950 to-neutral-950">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30" />
      
      <div className="container relative">
        <div className="py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand section */}
          <div className="md:col-span-2 space-y-8">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 hover:opacity-90 transition-opacity"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-xl shadow-primary-500/20 group-hover:shadow-primary-500/30 transition-all">
                {siteConfig.name.charAt(0)}
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-white">{siteConfig.name}</h3>
                <p className="text-sm text-primary-300">Desenvolvedor Full Stack</p>
              </div>
            </Link>

            <p className="text-neutral-400 max-w-md leading-relaxed">
              {siteConfig.description}
            </p>

            <div className="flex gap-4">
              {socialLinks.map(({ href, Icon, title }) => (
                <a
                  key={title}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/5 hover:bg-primary-600/20 hover:text-primary-400 rounded-xl transition-all duration-300 text-neutral-300"
                  title={title}
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Navegação</h3>
            <ul className="space-y-4">
              {['inicio', 'projetos', 'clientes', 'contato'].map((link) => (
                <li key={link}>
                  <Link
                    href={`/#${link}`}
                    className="text-neutral-400 hover:text-white flex items-center gap-2 transition-all group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 group-hover:bg-primary-400 transition-colors" />
                    {link.charAt(0).toUpperCase() + link.slice(1)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Contato</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:contato@seusite.com"
                  className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <Mail className="w-4 h-4 group-hover:text-primary-400" />
                  contato@seusite.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+5511999999999"
                  className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <span>📱</span>
                  +55 (11) 99999-9999
                </a>
              </li>
              <li className="text-neutral-400 flex items-center gap-2">
                <span>📍</span>
                São Paulo, SP - Brasil
              </li>
              <li>
                <div className="flex items-center gap-2 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                  <span className="text-green-400 text-sm font-medium">
                    Disponível para projetos
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="py-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-neutral-500">
              <span>© {currentYear} {siteConfig.name}. Feito com</span>
              <Heart className="w-4 h-4 text-red-400 fill-current animate-pulse" />
              <span>e muito código.</span>
            </div>

            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-neutral-500 hover:text-white transition-colors">
                Privacidade
              </Link>
              <Link href="/terms" className="text-neutral-500 hover:text-white transition-colors">
                Termos
              </Link>
              <span className="text-neutral-800">•</span>
              <span className="text-neutral-700">Next.js • Supabase • Tailwind CSS</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}