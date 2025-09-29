'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X, Home, User, Briefcase, Mail } from 'lucide-react';
import { publicNavigation, siteConfig } from '@/constants';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

// Mapeamento de ícones para cada item de navegação
const navigationIcons = {
  '/': Home,
  '/sobre': User,
  '/projetos': Briefcase,
  '/contato': Mail,
};

export default function Header() {
  const pathname = usePathname();
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
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const isAdminRoute = pathname.startsWith('/admin');
  if (isAdminRoute) {
    return null;
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white shadow-md border-b border-gray-200'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto px-4 w-full max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className={cn(
              "flex items-center space-x-3 font-bold text-xl transition-colors",
              isScrolled 
                ? "text-gray-800 hover:text-blue-600" 
                : "text-white hover:text-gray-200"
            )}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className={cn(
              "w-9 h-9 bg-white rounded-lg flex items-center justify-center overflow-hidden border",
              isScrolled 
                ? "border-gray-300" 
                : "border-white"
            )}>
              <Image
                src="/logo-nexus.png"
                alt="Logo da empresa"
                width={36}
                height={36}
                className="w-7 h-7 object-contain"
              />
            </div>
            <span className={isScrolled ? "text-gray-800" : "text-white"}>
              {siteConfig.name}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {publicNavigation.map((item) => {
              const IconComponent = navigationIcons[item.href as keyof typeof navigationIcons];
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors rounded-md',
                    isScrolled 
                      ? isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600' 
                      : isActive
                        ? 'bg-white text-gray-900'
                        : 'text-white hover:bg-white/20'
                  )}
                >
                  {IconComponent && <IconComponent className="w-4 h-4" />}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              ref={menuButtonRef}
              className={cn(
                "p-2 rounded-md transition-colors",
                isScrolled 
                  ? "bg-gray-100 hover:bg-gray-200 text-gray-700" 
                  : "bg-white/20 hover:bg-white/30 text-white"
              )}
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div 
        ref={mobileMenuRef}
        className={cn(
          "md:hidden fixed top-16 left-0 right-0 bg-white border-t border-gray-200 z-40 transform transition-all duration-300",
          isMobileMenuOpen 
            ? "translate-y-0 opacity-100" 
            : "-translate-y-4 opacity-0 pointer-events-none"
        )}
        style={{ 
          height: isMobileMenuOpen ? 'auto' : '0',
        }}
      >
        <nav className="p-4">
          <div className="space-y-2">
            {publicNavigation.map((item) => {
              const IconComponent = navigationIcons[item.href as keyof typeof navigationIcons];
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-md transition-colors",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  )}
                  onClick={handleLinkClick}
                >
                  {IconComponent && <IconComponent className="w-5 h-5" />}
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
      
      {/* Backdrop para mobile */}
      <div 
        className={cn(
          "md:hidden fixed inset-0 bg-black/50 z-30 transition-opacity duration-300",
          isMobileMenuOpen 
            ? "opacity-100" 
            : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
}