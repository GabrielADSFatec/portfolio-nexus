import Link from 'next/link';
import { Github, Linkedin, Mail, Heart } from 'lucide-react';
import { siteConfig, socialLinks } from '@/constants';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="container">
        {/* Main footer content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand section */}
          <div className="md:col-span-2">
            <Link
              href="/"
              className="flex items-center space-x-2 font-bold text-xl mb-4"
            >
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold">
                {siteConfig.name.charAt(0)}
              </div>
              <span>{siteConfig.name}</span>
            </Link>
            
            <p className="text-neutral-300 mb-6 max-w-md">
              {siteConfig.description}
            </p>

            {/* Social links */}
            <div className="flex space-x-4">
              <a
                href="https://github.com/seuusuario"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-neutral-800 rounded-lg hover:bg-primary-600 transition-colors"
                title="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com/in/seuusuario"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-neutral-800 rounded-lg hover:bg-primary-600 transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:contato@seusite.com"
                className="p-2 bg-neutral-800 rounded-lg hover:bg-primary-600 transition-colors"
                title="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Navegação</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/#inicio"
                  className="text-neutral-300 hover:text-white transition-colors"
                >
                  Início
                </Link>
              </li>
              <li>
                <Link
                  href="/#projetos"
                  className="text-neutral-300 hover:text-white transition-colors"
                >
                  Projetos
                </Link>
              </li>
              <li>
                <Link
                  href="/#clientes"
                  className="text-neutral-300 hover:text-white transition-colors"
                >
                  Clientes
                </Link>
              </li>
              <li>
                <Link
                  href="/#contato"
                  className="text-neutral-300 hover:text-white transition-colors"
                >
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contato</h3>
            <ul className="space-y-2 text-neutral-300">
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
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">Disponível para projetos</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-neutral-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-1 text-neutral-400 text-sm">
              <span>© {currentYear} {siteConfig.name}. Feito com</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>e muito código.</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-neutral-400">
              <Link
                href="/privacy"
                className="hover:text-white transition-colors"
              >
                Privacidade
              </Link>
              <Link
                href="/terms"
                className="hover:text-white transition-colors"
              >
                Termos
              </Link>
              <span className="opacity-50">|</span>
              <span>Next.js • Supabase • Tailwind CSS</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}