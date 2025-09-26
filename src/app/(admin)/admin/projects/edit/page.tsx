'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import ImageUploadWithPreview from '@/components/admin/ImageUploadWithPreview';
import TechnologyInput from '@/components/admin/TechnologyInput';
import ImageGalleryManager from '@/components/admin/ImageGalleryManager';
import SlugInput from '@/components/admin/SlugInput';

interface GalleryImage {
  id?: string;
  file: File | null;
  preview: string;
  alt: string;
  order: number;
  is_new?: boolean;
}

export default function CreateProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    full_description: '',
    technologies: [] as string[],
    github_url: '',
    live_url: '',
    order_index: 0,
    is_featured: false,
    is_active: true,
  });

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>('');
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

  const supabase = createClient();

  const checkSlugUnique = async (slug: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('projects')
      .select('id')
      .eq('slug', slug)
      .single();

    return !data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError('');
    setLoading(true);

    try {
      if (!formData.title.trim()) {
        throw new Error('O título é obrigatório');
      }

      if (!mainImage) {
        throw new Error('A imagem principal é obrigatória');
      }

      if (!formData.slug.trim()) {
        throw new Error('O slug é obrigatório');
      }

      const isSlugUnique = await checkSlugUnique(formData.slug);
      if (!isSlugUnique) {
        throw new Error('Este slug já está em uso. Escolha outro.');
      }

      const mainImageUrl = await uploadImage(mainImage, 'projects/main');
      if (!mainImageUrl) {
        throw new Error('Erro ao fazer upload da imagem principal');
      }

      const { data: existingProjects } = await supabase
        .from('projects')
        .select('order_index')
        .order('order_index', { ascending: false })
        .limit(1);

      const nextOrder = existingProjects && existingProjects.length > 0
        ? existingProjects[0].order_index + 1
        : 0;

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([
          {
            title: formData.title.trim(),
            slug: formData.slug.trim(),
            description: formData.description.trim(),
            full_description: formData.full_description.trim(),
            image_url: mainImageUrl,
            technologies: formData.technologies,
            github_url: formData.github_url.trim() || null,
            live_url: formData.live_url.trim() || null,
            order_index: formData.order_index || nextOrder,
            is_featured: formData.is_featured,
            is_active: formData.is_active,
          }
        ])
        .select()
        .single();

      if (projectError) throw projectError;

      if (galleryImages.length > 0) {
        const galleryPromises = galleryImages.map(async (galleryImage, index) => {
          if (galleryImage.file) {
            const imageUrl = await uploadImage(galleryImage.file, `projects/gallery/${project.id}`);
            if (imageUrl) {
              return supabase
                .from('project_images')
                .insert({
                  project_id: project.id,
                  image_url: imageUrl,
                  image_alt: galleryImage.alt.trim() || `Imagem ${index + 1} do projeto ${formData.title}`,
                  display_order: index,
                  is_active: true,
                });
            }
          }
          return Promise.resolve(null);
        });

        await Promise.all(galleryPromises);
      }

      alert('Projeto criado com sucesso!');
      // CORREÇÃO: Usar push em vez de replace e remover o refresh
      router.push('/admin/projects');
      
    } catch (err) {
      console.error('Erro ao criar projeto:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar projeto');
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File, path: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Erro no upload da imagem:', error);
      return null;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleTechnologiesChange = (technologies: string[]) => {
    setFormData(prev => ({
      ...prev,
      technologies,
    }));
  };

  const handleMainImageChange = (file: File | null) => {
    setMainImage(file);
    if (file) {
      const preview = URL.createObjectURL(file);
      setMainImagePreview(preview);
    } else {
      setMainImagePreview('');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/admin/projects"
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para a listagem
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Adicionar Projeto</h1>
          <p className="text-neutral-400">Cadastre um novo projeto no portfólio</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-6xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Seção: Informações Básicas */}
          <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700/50">
            <h2 className="text-lg font-semibold text-white mb-6">Informações Básicas</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-neutral-300 mb-2">
                  Título do Projeto *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Nome do projeto"
                />
              </div>

              <SlugInput
                value={formData.slug}
                onChange={(slug) => setFormData(prev => ({ ...prev, slug }))}
                title={formData.title}
                baseUrl={typeof window !== 'undefined' ? window.location.origin : ''}
                onSlugCheck={checkSlugUnique}
              />
            </div>

            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-neutral-300 mb-2">
                Descrição Curta *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical"
                placeholder="Descrição breve do projeto (aparece nos cards)"
                maxLength={200}
              />
              <div className="text-xs text-neutral-500 mt-1">
                {formData.description.length}/200 caracteres
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="full_description" className="block text-sm font-medium text-neutral-300 mb-2">
                Descrição Completa
              </label>
              <textarea
                id="full_description"
                name="full_description"
                rows={6}
                value={formData.full_description}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical"
                placeholder="Descrição detalhada do projeto (página individual)"
              />
            </div>
          </div>

          {/* Seção: Imagem Principal */}
          <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700/50">
            <h2 className="text-lg font-semibold text-white mb-6">Imagem Principal *</h2>
            <ImageUploadWithPreview
              onImageChange={handleMainImageChange}
              previewUrl={mainImagePreview}
              aspectRatio="video"
              label="Imagem Principal"
              required
            />
          </div>

          {/* Seção: Galeria de Imagens */}
          <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700/50">
            <h2 className="text-lg font-semibold text-white mb-6">Galeria de Imagens</h2>
            <ImageGalleryManager
              images={galleryImages}
              onImagesChange={setGalleryImages}
              maxImages={10}
            />
          </div>

          {/* Seção: Tecnologias */}
          <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700/50">
            <h2 className="text-lg font-semibold text-white mb-6">Tecnologias Utilizadas</h2>
            <TechnologyInput
              technologies={formData.technologies}
              onTechnologiesChange={handleTechnologiesChange}
            />
          </div>

          {/* Seção: Links e Configurações */}
          <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700/50">
            <h2 className="text-lg font-semibold text-white mb-6">Links e Configurações</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label htmlFor="github_url" className="block text-sm font-medium text-neutral-300 mb-2">
                  URL do GitHub
                </label>
                <input
                  type="url"
                  id="github_url"
                  name="github_url"
                  value={formData.github_url}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://github.com/usuario/projeto"
                />
              </div>

              <div>
                <label htmlFor="live_url" className="block text-sm font-medium text-neutral-300 mb-2">
                  URL do Projeto Online
                </label>
                <input
                  type="url"
                  id="live_url"
                  name="live_url"
                  value={formData.live_url}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://meuprojeto.com"
                />
              </div>

              <div>
                <label htmlFor="order_index" className="block text-sm font-medium text-neutral-300 mb-2">
                  Ordem de Exibição
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
                <div className="text-xs text-neutral-500 mt-1">
                  Número que define a ordem dos projetos (0 = primeiro)
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_featured"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-primary-500 bg-neutral-900 border-neutral-700 rounded focus:ring-primary-500 focus:ring-2"
                  />
                  <label htmlFor="is_featured" className="text-sm font-medium text-neutral-300">
                    Projeto em Destaque
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-primary-500 bg-neutral-900 border-neutral-700 rounded focus:ring-primary-500 focus:ring-2"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-neutral-300">
                    Projeto Ativo
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm p-4 bg-red-500/10 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/admin/projects"
              className="px-6 py-3 text-neutral-300 hover:text-white transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading || !formData.title || !mainImage || !formData.slug}
              className={cn(
                'flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg transition-colors',
                (loading || !formData.title || !mainImage || !formData.slug)
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-primary-600'
              )}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Criando Projeto...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Criar Projeto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}