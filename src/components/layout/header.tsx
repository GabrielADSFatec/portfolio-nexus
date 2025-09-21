'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { publicNavigation, siteConfig } from '@/constants';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    // Fechar menu ao clicar fora dele
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
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
            <Image
                            src="/logo-nexus.png"
                            alt="Logo da empresa"
                            width={50}
                            height={50}
                          />
            <Link
              href="/"
              className={cn(
                "flex items-center space-x-2 font-bold text-xl lg:text-2xl transition-colors group",
                isScrolled 
                  ? "text-primary-600 hover:text-primary-700" 
                  : "text-white hover:text-primary-200 drop-shadow-lg"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className={cn(
                "w-8 h-8 lg:w-10 lg:h-10 bg-gradient-primary rounded-lg flex items-center justify-center text-black font-bold shadow-lg group-hover:scale-105 transition-transform",
                !isScrolled && "shadow-black/30"
              )}>
                <Image
                            src="/logo-nexus.png"
                            alt="Logo da empresa"
                            width={50}
                            height={50}
                          />
              </div>
              <span className={!isScrolled ? "drop-shadow-sm" : ""}>{siteConfig.name}</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {publicNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'font-medium transition-all duration-200 hover:scale-105',
                    isScrolled 
                      ? 'text-neutral-700 hover:text-primary-600' 
                      : 'text-white hover:text-primary-200 drop-shadow-sm hover:drop-shadow-md'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                ref={menuButtonRef}
                className={cn(
                  "p-3 rounded-lg transition-all duration-200 touch-manipulation",
                  "min-w-[44px] min-h-[44px] flex items-center justify-center",
                  isScrolled 
                    ? "bg-white hover:bg-neutral-50 text-neutral-700 shadow-md border border-neutral-200" 
                    : "bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30"
                )}
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - Menu Overlay */}
        <div 
          ref={mobileMenuRef}
          className={cn(
            "md:hidden fixed top-16 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-white/20 z-40 transform transition-all duration-300 ease-in-out h-full overflow-y-auto",
            isMobileMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          )}
          style={{ 
            visibility: isMobileMenuOpen ? "visible" : "hidden",
            height: isMobileMenuOpen ? "calc(100vh - 64px)" : "0"
          }}
        >
          <nav className="py-4">
            {publicNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-6 py-4 font-medium text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200"
                onClick={handleLinkClick}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}