'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

interface ProjectImage {
  id: string;
  image_url: string;
  image_alt: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    full_description: '',
    github_url: '',
    live_url: '',
    order_index: 0,
    is_featured: false,
    is_active: true,
    technologies: [] as string[],
  });

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>('');
  const [originalMainImage, setOriginalMainImage] = useState<string>('');
  const [mainImageRemoved, setMainImageRemoved] = useState(false);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [existingImages, setExistingImages] = useState<ProjectImage[]>([]);

  const supabase = createClient();

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (projectError) throw projectError;

      const { data: images, error: imagesError } = await supabase
        .from('project_images')
        .select('*')
        .eq('project_id', id)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (imagesError) throw imagesError;

      setFormData({
        title: project.title,
        slug: project.slug,
        description: project.description,
        full_description: project.full_description || '',
        technologies: project.technologies || [],
        github_url: project.github_url || '',
        live_url: project.live_url || '',
        order_index: project.order_index,
        is_featured: project.is_featured,
        is_active: project.is_active,
      });

      setMainImagePreview(project.image_url);
      setOriginalMainImage(project.image_url);

      setExistingImages(images || []);

      const galleryImagesData: GalleryImage[] = (images || []).map(img => ({
        id: img.id,
        file: null,
        preview: img.image_url,
        alt: img.image_alt,
        order: img.display_order,
        is_new: false,
      }));

      setGalleryImages(galleryImagesData);

    } catch (error) {
      console.error('Erro ao carregar projeto:', error);
      setError('Erro ao carregar dados do projeto');
    } finally {
      setLoading(false);
    }
  };

  const checkSlugUnique = async (slug: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('projects')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .single();

    return !data;
  };

  const extractFilePathFromUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const publicIndex = pathParts.indexOf('public');
      if (publicIndex !== -1 && pathParts.length > publicIndex + 2) {
      // Pula "public" e o nome do bucket (portfolio-images)
      return pathParts.slice(publicIndex + 2).join("/");
    }
      return null;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("1. Início do handleSubmit");
    if (saving) return;
    setError('');
    setSaving(true);

    try {
      if (!formData.title.trim()) {
        throw new Error('O título é obrigatório');
      }

      if (!formData.slug.trim()) {
        throw new Error('O slug é obrigatório');
      }

      // Validação da imagem principal
      if (mainImageRemoved && !mainImage) {
        throw new Error('A imagem principal é obrigatória. Por favor, adicione uma nova imagem.');
      }

      const isSlugUnique = await checkSlugUnique(formData.slug);
      if (!isSlugUnique) {
        throw new Error('Este slug já está em uso. Escolha outro.');
      }

      let mainImageUrl = originalMainImage;

      if (mainImage) {
        if (originalMainImage) {
          const oldFilePath = extractFilePathFromUrl(originalMainImage);
          if (oldFilePath) {
            await supabase.storage
              .from('portfolio-images')
              .remove([oldFilePath])
              .catch(error => console.warn('Erro ao remover imagem antiga:', error));
          }
        }

        const uploadedUrl = await uploadImage(mainImage, 'projects/main');
        if (!uploadedUrl) {
          throw new Error('Erro ao fazer upload da nova imagem principal');
        }
        mainImageUrl = uploadedUrl;
      }
      console.log("2. Validações passadas, preparando para fazer upload/fazer update");

      const { error: projectError } = await supabase
        .from('projects')
        .update({
          title: formData.title.trim(),
          slug: formData.slug.trim(),
          description: formData.description.trim(),
          full_description: formData.full_description.trim(),
          image_url: mainImageUrl,
          technologies: formData.technologies,
          github_url: formData.github_url.trim() || null,
          live_url: formData.live_url.trim() || null,
          order_index: formData.order_index,
          is_featured: formData.is_featured,
          is_active: formData.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (projectError) throw projectError;

      await manageGalleryImages();
      console.log("3. Operação no Supabase bem-sucedida. Projeto salvo.");
      alert('Projeto atualizado com sucesso!');
      console.log("4. Antes do router.push");
      router.push('/admin/projects');
      console.log("5. Depois do router.push");
      
    } catch (err) {
      console.error('Erro ao atualizar projeto:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar projeto');
    } finally {
      setSaving(false);
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

  const manageGalleryImages = async () => {
    const imagesToDelete: string[] = [];
    const imagesToAdd: GalleryImage[] = [];
    const imagesToUpdate: { id: string; alt: string; order: number }[] = [];

    galleryImages.forEach((img, index) => {
      if (img.id && !img.is_new) {
        const originalImage = existingImages.find(existing => existing.id === img.id);
        if (originalImage && (img.alt !== originalImage.image_alt || index !== originalImage.display_order)) {
          imagesToUpdate.push({
            id: img.id,
            alt: img.alt,
            order: index,
          });
        }
      } else if (img.is_new && img.file) {
        imagesToAdd.push({ ...img, order: index });
      }
    });

    existingImages.forEach(existingImg => {
      const stillExists = galleryImages.some(img => img.id === existingImg.id);
      if (!stillExists) {
        imagesToDelete.push(existingImg.id);
      }
    });

    if (imagesToDelete.length > 0) {
      const deletePromises = imagesToDelete.map(async (imageId) => {
        const imageToDelete = existingImages.find(img => img.id === imageId);
        if (imageToDelete) {
          const filePath = extractFilePathFromUrl(imageToDelete.image_url);
          if (filePath) {
            await supabase.storage
              .from('portfolio-images')
              .remove([filePath])
              .catch(console.error);
          }
        }
      });

      await Promise.all(deletePromises);

      await supabase
        .from('project_images')
        .delete()
        .in('id', imagesToDelete);
    }

    if (imagesToAdd.length > 0) {
      const addPromises = imagesToAdd.map(async (img) => {
        if (img.file) {
          const imageUrl = await uploadImage(img.file, `projects/gallery/${id}`);
          if (imageUrl) {
            return supabase
              .from('project_images')
              .insert({
                project_id: id,
                image_url: imageUrl,
                image_alt: img.alt.trim() || `Imagem ${img.order + 1} do projeto ${formData.title}`,
                display_order: img.order,
                is_active: true,
              });
          }
        }
        return Promise.resolve(null);
      });

      await Promise.all(addPromises);
    }

    if (imagesToUpdate.length > 0) {
      const updatePromises = imagesToUpdate.map(update =>
        supabase
          .from('project_images')
          .update({
            image_alt: update.alt,
            display_order: update.order,
            updated_at: new Date().toISOString(),
          })
          .eq('id', update.id)
      );

      await Promise.all(updatePromises);
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
      // Nova imagem foi adicionada
      const preview = URL.createObjectURL(file);
      setMainImagePreview(preview);
      setMainImageRemoved(false);
    } else {
      // Imagem foi removida
      setMainImagePreview('');
      setMainImageRemoved(true);
    }
  };

  // Verifica se pode salvar
  const canSave = formData.title && formData.slug && (!mainImageRemoved || mainImage);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/admin/projects"
              className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar para a listagem
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Carregando...</h1>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl md:text-3xl font-bold text-white">Editar Projeto</h1>
          <p className="text-neutral-400">Editando: {formData.title}</p>
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
              required={true}
            />
            {mainImageRemoved && !mainImage && (
              <div className="flex items-center gap-2 text-amber-400 text-sm mt-3 p-3 bg-amber-500/10 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                Por favor, adicione uma nova imagem principal para poder salvar
              </div>
            )}
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
              disabled={saving || !canSave}
              className={cn(
                'flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg transition-colors',
                (saving || !canSave)
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-primary-600'
              )}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
        </form>
      </div>
    </div>
  );
}