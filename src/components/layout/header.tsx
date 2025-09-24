'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { publicNavigation, siteConfig } from '@/constants';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Header() {
  // ✅ PRIMEIRO: Todos os hooks devem vir ANTES de qualquer condicional
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // ✅ DEPOIS: Efeitos e outras lógicas
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current && 
        !mobileMenuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflowX = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflowX = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflowX = 'unset';
    };
  }, [isMobileMenuOpen]);

  // ✅ AGORA SIM: A condicional pode vir DEPOIS de todos os hooks
  const isAdminRoute = pathname.startsWith('/admin');
  if (isAdminRoute) {
    return null;
  }

  // 🔽 O RESTO DO CÓDIGO PERMANECE IGUAL 🔽

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <style jsx>{`
        @keyframes slideInFromRight {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-white/20'
            : 'bg-black/20 backdrop-blur-md border-b border-white/10'
        )}
      >
        <div className="mx-auto px-4 w-full max-w-7xl">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link
              href="/"
              className={cn(
                "flex items-center space-x-2 font-bold text-xl lg:text-2xl transition-colors group",
                isScrolled 
                  ? "text-neutral-800 hover:text-primary-700" 
                  : "text-white hover:text-primary-200 drop-shadow-lg"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className={cn(
                "w-8 h-8 lg:w-10 lg:h-10 bg-gradient-primary rounded-lg flex items-center justify-center text-black font-bold shadow-lg group-hover:scale-105 transition-transform overflow-hidden",
                !isScrolled && "shadow-black/30"
              )}>
                <Image
                  src="/logo-nexus.png"
                  alt="Logo da empresa"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className={cn(
                "transition-all duration-300",
                isScrolled 
                  ? "text-neutral-800" 
                  : "text-white drop-shadow-sm"
              )}>
                {siteConfig.name}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              {publicNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'relative px-4 py-2 text-lg font-semibold transition-all duration-300 rounded-lg group overflow-hidden',
                    isScrolled 
                      ? 'text-neutral-700 hover:text-white hover:bg-neutral-800' 
                      : 'text-white hover:text-neutral-900 hover:bg-white/20 backdrop-blur-sm drop-shadow-sm'
                  )}
                >
                  <span className="relative z-10 transition-all duration-300 group-hover:scale-105">
                    {item.name}
                  </span>
                  <div className={cn(
                    'absolute inset-0 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-lg',
                    isScrolled 
                      ? 'bg-neutral-800' 
                      : 'bg-white/20 backdrop-blur-sm'
                  )} />
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                ref={menuButtonRef}
                className={cn(
                  "p-3 rounded-xl transition-all duration-300 touch-manipulation group",
                  "min-w-[48px] min-h-[48px] flex items-center justify-center relative overflow-hidden",
                  isScrolled 
                    ? "bg-white hover:bg-neutral-100 text-neutral-700 shadow-lg border border-neutral-200 hover:shadow-xl hover:scale-105" 
                    : "bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl"
                )}
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
                aria-expanded={isMobileMenuOpen}
              >
                <div className={cn(
                  "absolute inset-0 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-xl",
                  isScrolled 
                    ? "bg-neutral-100" 
                    : "bg-white/10"
                )} />
                
                <div className="relative z-10 transition-transform duration-300 group-hover:rotate-180">
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div 
          ref={mobileMenuRef}
          className={cn(
            "md:hidden fixed top-16 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-white/20 z-40 transform transition-all duration-300 ease-in-out h-full overflow-y-auto shadow-2xl",
            isMobileMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          )}
          style={{ 
            visibility: isMobileMenuOpen ? "visible" : "hidden",
            height: isMobileMenuOpen ? "calc(100vh - 64px)" : "0"
          }}
        >
          <nav className="py-8">
            {publicNavigation.map((item, index) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "block mx-4 px-6 py-4 mb-2 text-lg font-semibold text-neutral-700 rounded-xl transition-all duration-300 group relative overflow-hidden",
                  "hover:bg-neutral-100 hover:text-neutral-900 hover:shadow-md hover:scale-[1.02] transform"
                )}
                onClick={handleLinkClick}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: isMobileMenuOpen ? 'slideInFromRight 0.5s ease-out forwards' : 'none'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-100 to-neutral-50 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-xl" />
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-neutral-800 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 rounded-r" />
                <span className="relative z-10 block transition-transform duration-300 group-hover:translate-x-2">
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}