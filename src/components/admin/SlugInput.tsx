// components/admin/SlugInput.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Link, RefreshCw, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlugInputProps {
  value: string;
  onChange: (slug: string) => void;
  title: string;
  baseUrl: string;
  className?: string;
  onSlugCheck?: (slug: string) => Promise<boolean>;
}

export default function SlugInput({
  value,
  onChange,
  title,
  baseUrl,
  className,
  onSlugCheck
}: SlugInputProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isCustom, setIsCustom] = useState(false);
  const [lastCheckedSlug, setLastCheckedSlug] = useState<string>('');

  // CORREÇÃO: useCallback para evitar recriação da função
  const generateSlug = useCallback((text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }, []);

  // CORREÇÃO CRÍTICA: useEffect com dependências corretas e condição de guarda
  useEffect(() => {
    if (!isCustom && title) {
      const newSlug = generateSlug(title);
      // Só atualiza se o slug gerado for diferente do atual
      if (newSlug !== value) {
        onChange(newSlug);
      }
    }
  }, [title, isCustom, generateSlug, value, onChange]);

  // CORREÇÃO: useEffect separado para verificação de disponibilidade
  useEffect(() => {
    const checkSlugAvailability = async () => {
      if (!value || !onSlugCheck) return;
      
      // Evita verificar o mesmo slug repetidamente
      if (value === lastCheckedSlug) return;

      setIsChecking(true);
      try {
        const available = await onSlugCheck(value);
        setIsAvailable(available);
        setLastCheckedSlug(value);
      } catch (error) {
        console.error('Erro ao verificar slug:', error);
        setIsAvailable(null);
      } finally {
        setIsChecking(false);
      }
    };

    // Debounce para evitar verificações desnecessárias
    const timeoutId = setTimeout(checkSlugAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [value, onSlugCheck, lastCheckedSlug]);

  const handleGenerateClick = () => {
    const newSlug = generateSlug(title);
    onChange(newSlug);
    setIsCustom(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = generateSlug(e.target.value);
    onChange(newSlug);
    setIsCustom(true);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <label className="block text-sm font-medium text-neutral-300">
        Slug da URL
      </label>

      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={value}
              onChange={handleInputChange}
              className={cn(
                "w-full px-4 py-3 bg-neutral-900 border rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-20",
                isAvailable === false ? "border-red-500" : "border-neutral-700",
                isAvailable === true ? "border-green-500" : ""
              )}
              placeholder="meu-projeto-incrivel"
            />
            
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              {isChecking && (
                <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
              )}
              {isAvailable === true && (
                <Check className="w-4 h-4 text-green-500" />
              )}
              {isAvailable === false && (
                <X className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateClick}
            className="px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-300 hover:bg-neutral-700 transition-colors whitespace-nowrap"
          >
            Gerar do Título
          </button>
        </div>

        {/* Preview da URL */}
        <div className="flex items-center gap-2 text-sm text-neutral-400 bg-neutral-900/50 p-3 rounded border border-neutral-700">
          <Link className="w-4 h-4" />
          <span className="truncate">
            {baseUrl}/projeto/
            <span className={cn(
              "font-mono",
              isAvailable === false ? "text-red-400" : "text-primary-400"
            )}>
              {value || 'meu-projeto'}
            </span>
          </span>
        </div>

        {/* Status do slug */}
        {isAvailable === false && (
          <div className="text-red-400 text-sm flex items-center gap-2">
            <X className="w-4 h-4" />
            Este slug já está em uso. Escolha outro.
          </div>
        )}
        {isAvailable === true && value && (
          <div className="text-green-400 text-sm flex items-center gap-2">
            <Check className="w-4 h-4" />
            Slug disponível!
          </div>
        )}
      </div>

      <div className="text-xs text-neutral-500 space-y-1">
        <p>• O slug é usado na URL do projeto</p>
        <p>• Deve ser único e em formato amigável</p>
        <p>• Use apenas letras, números e hífens</p>
      </div>
    </div>
  );
}