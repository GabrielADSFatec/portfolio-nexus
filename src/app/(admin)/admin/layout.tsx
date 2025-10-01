'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Images, 
  Briefcase, 
  Users, 
  MessageSquare, 
  LogOut,
  Menu,
  X,
  Settings,
  Home
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { adminNavigation, siteConfig } from '@/constants';
import { cn } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';

const iconMap = {
  LayoutDashboard,
  Images,
  Briefcase,
  Users,
  MessageSquare,
  Settings,
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const supabase = useMemo(() => createClient(), []);
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);

      if (!user) {
        router.push('/login');
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          router.push('/login');
        } else if (session?.user) {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  // Bloqueia o scroll do body E do html quando o sidebar está aberto no mobile
  useEffect(() => {
    if (sidebarOpen) {
      // Salva a posição atual do scroll
      const scrollY = window.scrollY;
      
      // Aplica os estilos para bloquear o scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Remove os estilos e restaura a posição do scroll
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [sidebarOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-neutral-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-neutral-800 border-r border-neutral-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          {/* Header do Sidebar */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-neutral-700 flex-shrink-0">
            <Link
              href="/admin/dashboard"
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
                {siteConfig.name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-neutral-100">Admin</div>
                <div className="text-xs text-neutral-400">{siteConfig.name}</div>
              </div>
            </Link>

            {/* Close button mobile */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-neutral-700"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            {/* Navigation */}
            <nav className="px-4 py-6 space-y-1">
              {adminNavigation.map((item) => {
                const Icon = iconMap[item.icon as keyof typeof iconMap];
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary-500/20 text-primary-300 border-r-2 border-primary-500'
                        : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <div>
                      <div>{item.name}</div>
                      <div className="text-xs text-neutral-400 mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Quick Actions */}
            <div className="px-4 py-4 border-t border-neutral-700">
              <div className="space-y-1">
                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-300 rounded-lg hover:bg-neutral-700 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Ver Site
                </Link>
               { /*
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-300 rounded-lg hover:bg-neutral-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Configurações
                </Link>
              */}
              </div>
            </div>

            {/* User info & Logout */}
            <div className="p-4 border-t border-neutral-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                  <span className="text-primary-300 font-medium text-sm">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-neutral-100 truncate">
                    {user.user_metadata?.full_name || 'Admin'}
                  </div>
                  <div className="text-xs text-neutral-400 truncate">
                    {user.email}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                <LogOut className="w-8 h-8" />
                {isLoggingOut ? 'Saindo...' : 'Sair'}
              </button>
            </div>
          </div>


        </div>
      </aside>

      {/* Main Content - SEM HEADER/TOP BAR */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        {/* Botão de abrir menu mobile - aparece apenas quando sidebar está fechado em mobile */}
        {!sidebarOpen && (
          <button
            className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-neutral-800 rounded-lg border border-neutral-700 hover:bg-neutral-700 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        )}

        {/* Page content direto - sem top bar */}
        <div className="p-6 lg:p-8 pt-16 lg:pt-8"> {/* pt-16 para dar espaço ao botão mobile */}
          {children}
        </div>
      </main>

      {/* Overlay para mobile quando sidebar está aberto */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}