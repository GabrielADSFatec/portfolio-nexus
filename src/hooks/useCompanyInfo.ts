// hooks/useCompanyInfo.ts
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface CompanyInfo {
  key: string;
  value: string;
  label: string;
  type: string;
}

export default function useCompanyInfo() {
  const [companyInfo, setCompanyInfo] = useState<Record<string, CompanyInfo>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const loadCompanyInfo = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from('company_info')
          .select('key, value, label, type')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (supabaseError) throw supabaseError;

        if (data) {
          const infoMap: Record<string, CompanyInfo> = {};
          data.forEach(item => {
            infoMap[item.key] = item;
          });
          setCompanyInfo(infoMap);
        }
      } catch (err) {
        console.error('Erro ao carregar informações:', err);
        setError('Erro ao carregar informações de contato');
      } finally {
        setIsLoading(false);
      }
    };

    loadCompanyInfo();
  }, [supabase]);

  return { companyInfo, isLoading, error };
}