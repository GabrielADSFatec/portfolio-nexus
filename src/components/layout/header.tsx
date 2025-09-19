// components/layout/header.tsx
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
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = () => setIsMobileMenuOpen(false);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/90 backdrop-blur-lg shadow-md dark:bg-neutral-900/90'
          : 'bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600'
      )}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            href="/"
            className={cn(
              "flex items-center space-x-3 font-bold text-xl lg:text-2xl transition-colors",
              isScrolled 
                ? "text-neutral-900 dark:text-white" 
                : "text-white"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-md",
              isScrolled 
                ? "bg-primary-600 text-white" 
                : "bg-white/20 text-white"
            )}>
              {siteConfig.name.charAt(0)}
            </div>
            <span>{siteConfig.name}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {publicNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'font-medium transition-colors',
                  isScrolled
                    ? 'text-neutral-700 hover:text-primary-600 dark:text-neutral-300 dark:hover:text-primary-400'
                    : 'text-white hover:text-primary-200'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className={cn(
              "md:hidden p-2 rounded-lg transition-colors",
              isScrolled
                ? "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                : "hover:bg-white/20"
            )}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className={cn(
                "w-6 h-6",
                isScrolled ? "text-neutral-700 dark:text-white" : "text-white"
              )} />
            ) : (
              <Menu className={cn(
                "w-6 h-6",
                isScrolled ? "text-neutral-700 dark:text-white" : "text-white"
              )} />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className={cn(
              "rounded-xl shadow-lg mt-2 py-4",
              isScrolled
                ? "bg-white dark:bg-neutral-800"
                : "bg-white/10 backdrop-blur-md"
            )}>
              <nav className="flex flex-col space-y-1">
                {publicNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "px-4 py-3 font-medium transition-colors",
                      isScrolled
                        ? "text-neutral-700 hover:bg-neutral-50 hover:text-primary-600 dark:text-neutral-300 dark:hover:bg-neutral-700"
                        : "text-white hover:bg-white/20"
                    )}
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