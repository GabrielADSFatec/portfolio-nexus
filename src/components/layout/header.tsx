'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { publicNavigation, siteConfig } from '@/constants';
import { cn } from '@/lib/utils';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-white/20'
          : 'bg-black/20 backdrop-blur-md border-b border-white/10'
      )}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            href="/"
            className={cn(
              "flex items-center space-x-2 font-bold text-xl lg:text-2xl transition-colors group",
              isScrolled 
                ? "text-primary-600 hover:text-primary-700" 
                : "text-white hover:text-primary-200 drop-shadow-lg"
            )}
          >
            <div className={cn(
              "w-8 h-8 lg:w-10 lg:h-10 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-105 transition-transform",
              !isScrolled && "shadow-black/30"
            )}>
              {siteConfig.name.charAt(0)}
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
          <button
            className={cn(
              "md:hidden p-2 rounded-lg transition-all duration-200 hover:scale-105",
              isScrolled 
                ? "hover:bg-neutral-100 text-neutral-700" 
                : "hover:bg-white/20 text-white backdrop-blur-sm"
            )}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 drop-shadow-sm" />
            ) : (
              <Menu className="w-6 h-6 drop-shadow-sm" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="bg-white/95 backdrop-blur-lg rounded-lg shadow-xl mt-2 py-4 border border-white/20">
              <nav className="flex flex-col space-y-1">
                {publicNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="px-4 py-3 font-medium text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 hover:translate-x-1"
                    onClick={handleLinkClick}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}