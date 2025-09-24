//edição

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Save,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Use as mesmas funções de formatação e validação da criação
const formatUrl = (url: string): string => {
  if (!url) return "";
  url = url.trim();
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("www.")) return `https://${url}`;
  if (url.includes(".")) return `https://${url}`;
  return "";
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

const extractFilePathFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    const publicIndex = pathParts.indexOf("public");
    if (publicIndex !== -1) {
      return pathParts.slice(publicIndex + 1).join("/");
    }
    return null;
  } catch {
    return null;
  }
};

export default function EditCarouselPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadError, setUploadError] = useState<string>("");
  const [originalImageUrl, setOriginalImageUrl] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    link_url: "",
    order_index: 0,
    is_active: true,
  });

  const [errors, setErrors] = useState({
    link_url: "",
  });

  const supabase = createClient();

  useEffect(() => {
    const loadCarouselItem = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("carousel_items")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        setFormData({
          title: data.title,
          description: data.description || "",
          image_url: data.image_url,
          link_url: data.link_url || "",
          order_index: data.order_index,
          is_active: data.is_active,
        });
        setImagePreview(data.image_url);
        setOriginalImageUrl(data.image_url);
      } catch (error) {
        console.error("Erro ao carregar item:", error);
        alert("Erro ao carregar dados do item.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadCarouselItem();
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError("");

    if (file) {
      // Validações (mesmas da criação)
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setUploadError("Formato inválido. Use apenas JPG, PNG ou WEBP.");
        e.target.value = "";
        return;
      }

      if (file.size > 3 * 1024 * 1024) {
        setUploadError("A imagem deve ter no máximo 3MB.");
        e.target.value = "";
        return;
      }

      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(originalImageUrl);
    const fileInput = document.getElementById(
      "image-upload"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError("");
    setErrors({ link_url: "" });

    // Validação de URL
    if (formData.link_url && !isValidUrlFormat(formData.link_url)) {
      setErrors({
        link_url: "Formato de URL inválido. Use: site.com ou www.site.com",
      });
      return;
    }

    if (!formData.title) {
      setUploadError("Preencha o título");
      return;
    }

    setSaving(true);

    try {
      let imageUrl = formData.image_url;

      // Upload da nova imagem se fornecida
      if (imageFile) {
        // Remove imagem antiga se existir
        if (originalImageUrl) {
          const oldFilePath = extractFilePathFromUrl(originalImageUrl);
          if (oldFilePath) {
            await supabase.storage
              .from("portfolio-images")
              .remove([oldFilePath])
              .catch((error) =>
                console.warn("Erro ao remover imagem antiga:", error)
              );
          }
        }

        // Upload da nova imagem
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}.${fileExt}`;
        const filePath = `carousel/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("portfolio-images")
          .upload(filePath, imageFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("portfolio-images").getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // Formata a URL
      const formattedLinkUrl = formData.link_url
        ? formatUrl(formData.link_url)
        : null;

      // Atualiza no banco
      const { error } = await supabase
        .from("carousel_items")
        .update({
          title: formData.title,
          description: formData.description,
          image_url: imageUrl,
          link_url: formattedLinkUrl,
          order_index: formData.order_index,
          is_active: formData.is_active,
        })
        .eq("id", id);

      if (error) throw error;

      alert("Item atualizado com sucesso!");
      router.push("/admin/carousel");
      router.refresh();
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      setUploadError(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar item. Tente novamente."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));

    if (name === "link_url") {
      setErrors((prev) => ({ ...prev, link_url: "" }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/admin/carousel"
              className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar para a listagem
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Carregando...
            </h1>
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
            href="/admin/carousel"
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para a listagem
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Editar Slide
          </h1>
          <p className="text-neutral-400">Editando: {formData.title}</p>
        </div>
      </div>

      {/* Form (similar ao de criação, com pequenas adaptações) */}
      <div className="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700/50">
            <label className="block text-lg font-medium text-white mb-4">
              Imagem do Slide
            </label>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="aspect-video bg-neutral-700/50 rounded-lg border-2 border-dashed border-neutral-600 overflow-hidden flex items-center justify-center relative">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      style={{ objectFit: "cover" }}
                      className="rounded-lg"
                    />
                  ) : (
                    <div className="text-center text-neutral-400">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                      <p>Nenhuma imagem</p>
                    </div>
                  )}
                </div>
                {imageFile && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="mt-2 flex items-center gap-1 text-red-400 text-sm hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remover nova imagem
                  </button>
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Alterar imagem (opcional)
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/jpeg, image/jpg, image/png, image/webp"
                    onChange={handleImageChange}
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
                  <p>• Deixe em branco para manter a imagem atual</p>
                  <p>• Formatos: JPG, PNG, WEBP</p>
                  <p>
                    • Tamanho máximo: <strong>3MB</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Text Fields */}
          <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700/50 space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-neutral-300 mb-2"
              >
                Título *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Título do slide"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-neutral-300 mb-2"
              >
                Descrição
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical"
                placeholder="Descrição opcional do slide"
              />
            </div>

            <div>
              <label
                htmlFor="link_url"
                className="block text-sm font-medium text-neutral-300 mb-2"
              >
                Link (URL)
              </label>
              <input
                type="url"
                id="link_url"
                name="link_url"
                value={formData.link_url}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://exemplo.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="order_index"
                  className="block text-sm font-medium text-neutral-300 mb-2"
                >
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
                <label
                  htmlFor="is_active"
                  className="text-sm font-medium text-neutral-300"
                >
                  Slide ativo
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/admin/carousel"
              className="px-6 py-3 text-neutral-300 hover:text-white transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving || !formData.title}
              className={cn(
                "flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg transition-colors",
                saving || !formData.title
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-primary-600"
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
