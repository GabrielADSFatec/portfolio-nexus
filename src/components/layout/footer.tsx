import Link from 'next/link';
import { Github, Linkedin, Mail, Heart } from 'lucide-react';
import { siteConfig } from '@/constants';
import { customClasses } from '@/constants/themes';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative">
      {/* gradiente azul sutil no fundo */}
      <div className={`${customClasses.gradients.dark} text-neutral-100`}>
        <div className="container">
          <div className="py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand section */}
            <div className="md:col-span-2">
              <Link
                href="/"
                className="flex items-center space-x-3 font-bold text-2xl mb-6 text-white"
              >
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                  {siteConfig.name.charAt(0)}
                </div>
                <span>{siteConfig.name}</span>
              </Link>

              <p className="text-neutral-300 mb-8 max-w-md leading-relaxed">
                {siteConfig.description}
              </p>

              <div className="flex space-x-4">
                {[
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
                ].map(({ href, Icon, title }) => (
                  <a
                    key={title}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors shadow-md"
                    title={title}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h3 className="font-semibold text-lg mb-4 text-white">Navegação</h3>
              <ul className="space-y-3">
                {['inicio', 'projetos', 'clientes', 'contato'].map((link) => (
                  <li key={link}>
                    <Link
                      href={`/#${link}`}
                      className="text-neutral-300 hover:text-white transition-colors"
                    >
                      {link.charAt(0).toUpperCase() + link.slice(1)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact info */}
            <div>
              <h3 className="font-semibold text-lg mb-4 text-white">Contato</h3>
              <ul className="space-y-3 text-neutral-300">
                <li>
                  <a
                    href="mailto:contato@seusite.com"
                    className="hover:text-white transition-colors"
                  >
                    contato@seusite.com
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+5511999999999"
                    className="hover:text-white transition-colors"
                  >
                    +55 (11) 99999-9999
                  </a>
                </li>
                <li>São Paulo, SP - Brasil</li>
                <li className="flex items-center gap-2 mt-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-400">
                    Disponível para projetos
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom section */}
          <div className="border-t border-white/10 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-neutral-400 text-sm">
              <div className="flex items-center gap-1">
                <span>© {currentYear} {siteConfig.name}. Feito com</span>
                <Heart className="w-4 h-4 text-red-500 fill-current" />
                <span>e muito código.</span>
              </div>

              <div className="flex items-center gap-6">
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacidade
                </Link>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Termos
                </Link>
                <span className="opacity-50">|</span>
                <span>Next.js • Supabase • Tailwind CSS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
