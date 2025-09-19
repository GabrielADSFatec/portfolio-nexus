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
        
        // Forçar refresh para atualizar o middleware
        router.push(redirectTo);
        router.refresh();
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-primary-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center space-x-3 font-bold text-2xl text-primary-600 hover:text-primary-700 transition-colors mb-8 group"
          >
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform">
              {siteConfig.name.charAt(0)}
            </div>
            <div>
              <div className="text-left">
                <div className="text-lg">{siteConfig.name}</div>
                <div className="text-sm text-neutral-500 font-normal">Admin Panel</div>
              </div>
            </div>
          </Link>
          
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">
            Acesso Administrativo
          </h2>
          <p className="text-neutral-600">
            Faça login para gerenciar seu portfólio
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-sm py-10 px-8 shadow-xl rounded-2xl border border-white/50">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 text-sm font-medium">Erro no login</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={cn(
                    'input pl-12',
                    'focus:ring-primary-500 focus:border-primary-500'
                  )}
                  placeholder="seu@email.com"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={cn(
                    'input pl-12 pr-12',
                    'focus:ring-primary-500 focus:border-primary-500'
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
                    <EyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-neutral-400 hover:text-neutral-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !formData.email || !formData.password}
              className={cn(
                'btn btn-primary w-full py-4 text-lg font-semibold',
                'shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30',
                (isLoading || !formData.email || !formData.password) && 'opacity-50 cursor-not-allowed'
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
        <div className="bg-primary-50/50 backdrop-blur-sm p-6 rounded-xl border border-primary-200/50 text-center">
          <div className="flex items-center justify-center gap-2 text-primary-700 mb-2">
            <Lock className="w-4 h-4" />
            <span className="text-sm font-medium">Área Segura</span>
          </div>
          <p className="text-xs text-primary-600">
            Esta área é protegida e monitorada. Apenas administradores autorizados podem acessar.
          </p>
        </div>
      </div>
    </div>
  );
}