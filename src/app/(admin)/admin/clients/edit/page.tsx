'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Save, Upload, Building, Globe, AlertCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const formatUrl = (url: string): string => {
  if (!url) return '';
  url = url.trim();
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('www.')) return `https://${url}`;
  if (url.includes('.')) return `https://${url}`;
  return '';
};

const isValidUrlFormat = (url: string): boolean => {
  if (!url) return true;
  const formatted = formatUrl(url);
  try {
    new URL(formatted);
    return true;
  } catch {
    return false;
  }
};

export default function CreateClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: '',
    website_url: '',
    description: '',
    order_index: 0,
    is_active: true,
  });

  const [errors, setErrors] = useState({
    website_url: '',
  });

  const supabase = createClient();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError('');
    
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        setUploadError('Formato inválido. Use JPG, PNG, WEBP ou SVG.');
        e.target.value = '';
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        setUploadError('O logo deve ter no máximo 2MB.');
        e.target.value = '';
        return;
      }
      
      setLogoFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');
    setErrors({ website_url: '' });

    if (formData.website_url && !isValidUrlFormat(formData.website_url)) {
      setErrors({ website_url: 'Formato de URL inválido. Use: site.com ou www.site.com' });
      return;
    }

    if (!formData.name || !logoFile) {
      setUploadError(!logoFile ? 'Selecione um logo' : 'Preencha o nome');
      return;
    }

    setLoading(true);

    try {
      let logoUrl = '';

      // Upload do logo
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `clients/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('portfolio-images')
          .upload(filePath, logoFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('portfolio-images')
          .getPublicUrl(filePath);

        logoUrl = publicUrl;
      }

      // Determinar a próxima ordem disponível
      const { data: existingClients } = await supabase
        .from('clients')
        .select('order_index')
        .order('order_index', { ascending: false })
        .limit(1);

      const nextOrder = existingClients && existingClients.length > 0 
        ? existingClients[0].order_index + 1 
        : 0;

      // Formata a URL do website
      const formattedWebsiteUrl = formData.website_url ? formatUrl(formData.website_url) : null;

      // Insere no banco de dados
      const { error } = await supabase
        .from('clients')
        .insert([
          {
            name: formData.name,
            logo_url: logoUrl,
            website_url: formattedWebsiteUrl,
            description: formData.description,
            order_index: formData.order_index || nextOrder,
            is_active: formData.is_active,
          }
        ]);

      if (error) throw error;

      alert('Cliente criado com sucesso!');
      router.push('/admin/clients');
      router.refresh();
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      setUploadError('Erro ao criar cliente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));

    if (name === 'website_url') {
      setErrors(prev => ({ ...prev, website_url: '' }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-900 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/admin/clients"
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para a listagem
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Adicionar Cliente</h1>
          <p className="text-neutral-400">Cadastre um novo cliente/empresa</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Upload */}
          <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700/50">
            <label className="block text-lg font-medium text-white mb-4">Logo do Cliente *</label>
            
            <div className="flex flex-col md:flex-row gap-6">
              {/* Preview */}
              <div className="flex-1">
                <div className="aspect-square bg-neutral-700/50 rounded-lg border-2 border-dashed border-neutral-600 overflow-hidden flex items-center justify-center">
                  {logoPreview ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={logoPreview}
                        alt="Preview"
                        fill
                        style={{ objectFit: 'contain' }}
                        className="rounded-lg p-4"
                      />
                    </div>
                  ) : (
                    <div className="text-center text-neutral-400">
                      <Building className="w-12 h-12 mx-auto mb-2" />
                      <p>Nenhum logo selecionado</p>
                    </div>
                  )}
                </div>
                {logoFile && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="mt-2 flex items-center gap-1 text-red-400 text-sm hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remover logo
                  </button>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Selecione um logo *
                  </label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/jpeg, image/jpg, image/png, image/webp, image/svg+xml"
                    onChange={handleLogoChange}
                    className="w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-primary-500 file:text-white hover:file:bg-primary-600 transition-colors"
                  />
                </div>
                
                {uploadError && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {uploadError}
                  </div>
                )}
                
                <div className="text-sm text-neutral-400">
                  <p>• Formatos: JPG, PNG, WEBP, SVG</p>
                  <p>• Tamanho máximo: <strong>2MB</strong></p>
                  <p>• Ideal: quadrado ou retangular, fundo transparente</p>
                </div>
              </div>
            </div>
          </div>

          {/* Text Fields */}
          <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700/50 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-2">
                Nome do Cliente *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Nome da empresa/cliente"
              />
            </div>

            <div>
              <label htmlFor="website_url" className="block text-sm font-medium text-neutral-300 mb-2">
                Website (Opcional)
              </label>
              <input
                type="text"
                id="website_url"
                name="website_url"
                value={formData.website_url}
                onChange={handleChange}
                className={cn(
                  "w-full px-4 py-3 bg-neutral-900 border rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                  errors.website_url ? "border-red-500" : "border-neutral-700"
                )}
                placeholder="exemplo.com ou www.exemplo.com"
              />
              {errors.website_url && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.website_url}
                </p>
              )}
              <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                <Globe className="w-3 h-3" />
                https:// será adicionado automaticamente
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-300 mb-2">
                Descrição (Opcional)
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical"
                placeholder="Breve descrição sobre o cliente/empresa..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="order_index" className="block text-sm font-medium text-neutral-300 mb-2">
                  Ordem de exibição
                </label>
                <input
                  type="number"
                  id="order_index"
                  name="order_index"
                  min="0"
                  value={formData.order_index}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Número que define a ordem dos clientes (0 = primeiro)
                </p>
              </div>

              <div className="flex items-center space-x-3 pt-6">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 text-primary-500 bg-neutral-900 border-neutral-700 rounded focus:ring-primary-500 focus:ring-2"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-neutral-300">
                  Cliente ativo
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/admin/clients"
              className="px-6 py-3 text-neutral-300 hover:text-white transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading || !formData.name || !logoFile}
              className={cn(
                'flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg transition-colors',
                (loading || !formData.name || !logoFile) 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-primary-600'
              )}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Cliente
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}