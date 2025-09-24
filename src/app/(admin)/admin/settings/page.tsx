'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Save, Loader2, Building, Mail, Phone, MapPin, Globe, Edit3 } from 'lucide-react';

interface CompanyInfo {
  id: string;
  key: string;
  value: string;
  label: string;
  type: 'text' | 'email' | 'url' | 'textarea';
  is_active: boolean;
  display_order: number;
}

const defaultSettings: Omit<CompanyInfo, 'id' | 'created_at' | 'updated_at'>[] = [
  { key: 'company_name', label: 'Nome da Empresa', value: '', type: 'text', is_active: true, display_order: 1 },
  { key: 'company_email', label: 'E-mail', value: '', type: 'email', is_active: true, display_order: 2 },
  { key: 'company_phone', label: 'Telefone', value: '', type: 'text', is_active: true, display_order: 3 },
  { key: 'company_address', label: 'Endereço', value: '', type: 'textarea', is_active: true, display_order: 4 },
  { key: 'company_website', label: 'Website', value: '', type: 'url', is_active: true, display_order: 5 },
  { key: 'company_description', label: 'Descrição', value: '', type: 'textarea', is_active: true, display_order: 6 },
];

const getIconForKey = (key: string) => {
  switch (key) {
    case 'company_name': return <Building className="w-5 h-5" />;
    case 'company_email': return <Mail className="w-5 h-5" />;
    case 'company_phone': return <Phone className="w-5 h-5" />;
    case 'company_address': return <MapPin className="w-5 h-5" />;
    case 'company_website': return <Globe className="w-5 h-5" />;
    default: return <Edit3 className="w-5 h-5" />;
  }
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<CompanyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('company_info')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setSettings(data);
      } else {
        // Se não há dados, cria os padrões
        await createDefaultSettings();
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setSaveMessage({ type: 'error', text: 'Erro ao carregar configurações' });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSettings = async () => {
    try {
      const { error } = await supabase
        .from('company_info')
        .insert(defaultSettings);

      if (error) throw error;

      // Recarrega as configurações
      const { data } = await supabase
        .from('company_info')
        .select('*')
        .order('display_order', { ascending: true });

      setSettings(data || []);
    } catch (error) {
      console.error('Erro ao criar configurações padrão:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);

    try {
      const updates = settings.map(setting => ({
        id: setting.id,
        value: setting.value,
      }));

      // Atualiza cada setting individualmente
      for (const update of updates) {
        const { error } = await supabase
          .from('company_info')
          .update({ value: update.value })
          .eq('id', update.id);

        if (error) throw error;
      }

      setSaveMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      
      // Remove a mensagem após 3 segundos
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setSaveMessage({ type: 'error', text: 'Erro ao salvar configurações' });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (id: string, value: string) => {
    setSettings(prev => prev.map(setting => 
      setting.id === id ? { ...setting, value } : setting
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Configurações</h1>
              <p className="text-neutral-400">Carregando informações da empresa...</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-neutral-800/50 p-6 rounded-xl border border-neutral-700/50 animate-pulse">
                <div className="h-4 bg-neutral-700 rounded w-32 mb-4"></div>
                <div className="h-10 bg-neutral-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
            <Building className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Configurações</h1>
            <p className="text-neutral-400">Gerencie as informações da sua empresa</p>
          </div>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className={`p-4 rounded-lg mb-6 ${
            saveMessage.type === 'success' 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {saveMessage.text}
          </div>
        )}

        {/* Settings Form */}
        <div className="space-y-6">
          {settings.map((setting) => (
            <div key={setting.id} className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700/50">
              <div className="flex items-center gap-3 mb-4">
                {getIconForKey(setting.key)}
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    {setting.label}
                  </label>
                  <p className="text-xs text-neutral-400">
                    Chave: <code className="bg-neutral-700 px-1 rounded">{setting.key}</code>
                  </p>
                </div>
              </div>

              {setting.type === 'textarea' ? (
                <textarea
                  value={setting.value}
                  onChange={(e) => updateSetting(setting.id, e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical"
                  placeholder={`Digite ${setting.label.toLowerCase()}...`}
                />
              ) : (
                <input
                  type={setting.type}
                  value={setting.value}
                  onChange={(e) => updateSetting(setting.id, e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={`Digite ${setting.label.toLowerCase()}...`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Alterações
              </>
            )}
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-neutral-800/30 rounded-xl p-6 border border-neutral-700/50">
          <h3 className="text-lg font-semibold text-white mb-3">💡 Como usar</h3>
          <div className="text-sm text-neutral-400 space-y-2">
            <p>• Estas informações serão exibidas no site público</p>
            <p>• Use campos de texto para informações gerais</p>
            <p>• Use URLs para links do site e redes sociais</p>
            <p>• As alterações são salvas automaticamente no banco de dados</p>
          </div>
        </div>
      </div>
    </div>
  );
}