'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Lock, Mail, AlertCircle, LogIn } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/constants';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        // Traduzir erros comuns para português
        let errorMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email não confirmado. Verifique sua caixa de entrada.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Muitas tentativas. Tente novamente em alguns minutos.';
        }
        setError(errorMessage);
        return;
      }

      if (data.user) {
        // Pegar parâmetro de redirect se existir
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get('redirect') || '/admin/dashboard';
        
        window.location.href = redirectTo;
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
      console.error('Erro no login:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpar erro quando usuário começar a digitar
    if (error) setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 to-primary-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center space-x-3 font-bold text-2xl text-white hover:text-primary-300 transition-colors mb-8 group"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform">
              {siteConfig.name.charAt(0)}
            </div>
            <div>
              <div className="text-left">
                <div className="text-lg text-white">{siteConfig.name}</div>
                <div className="text-sm text-neutral-300 font-normal">Admin Panel</div>
              </div>
            </div>
          </Link>
          
          <h2 className="text-3xl font-bold text-white mb-2">
            Acesso Administrativo
          </h2>
          <p className="text-neutral-300">
            Faça login para gerenciar seu portfólio
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white py-10 px-8 shadow-2xl rounded-2xl border border-neutral-200">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border-2 border-red-300 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 text-sm font-semibold">Erro no login</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-800 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={cn(
                    'w-full rounded-xl border border-neutral-300 py-3 pl-12',
                    'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                    'text-neutral-900 placeholder-neutral-400'
                  )}
                  placeholder="seu@email.com"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-800 mb-1">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={cn(
                    'w-full rounded-xl border border-neutral-300 py-3 pl-12 pr-12',
                    'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                    'text-neutral-900 placeholder-neutral-400'
                  )}
                  placeholder="Sua senha"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-neutral-500 hover:text-neutral-700 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-neutral-500 hover:text-neutral-700 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !formData.email || !formData.password}
              className={cn(
                'w-full py-4 px-6 text-lg font-medium rounded-xl',
                'bg-gradient-to-r from-blue-600 to-indigo-600',
                'hover:from-blue-700 hover:to-indigo-700',
                'active:from-blue-800 active:to-indigo-800',
                'text-white tracking-wide',
                'transition-all duration-200 ease-in-out',
                'shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-600/30',
                'border border-blue-500/20',
                'transform hover:-translate-y-0.5 active:translate-y-0',
                (isLoading || !formData.email || !formData.password) && 
                'opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-lg'
              )}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Entrando...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <LogIn className="w-5 h-5" />
                  <span>Entrar no Admin</span>
                </div>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600 transition-colors font-medium"
            >
              ← Voltar ao site
            </Link>
          </div>
        </div>

        {/* Security note */}
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 text-center">
          <div className="flex items-center justify-center gap-2 text-white mb-2">
            <Lock className="w-4 h-4" />
            <span className="text-sm font-medium">Área Segura</span>
          </div>
          <p className="text-xs text-neutral-300">
            Esta área é protegida e monitorada. Apenas administradores autorizados podem acessar.
          </p>
        </div>
      </div>
    </div>
  );
}