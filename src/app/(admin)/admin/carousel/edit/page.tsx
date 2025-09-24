//criação

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Save,
  Upload,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Função para formatar URL automaticamente
const formatUrl = (url: string): string => {
  if (!url) return "";

  // Remove espaços e caracteres desnecessários
  url = url.trim();

  // Se já tem http:// ou https://, retorna como está
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Se começa com www., adiciona https://
  if (url.startsWith("www.")) {
    return `https://${url}`;
  }

  // Se tem um ponto (domínio), adiciona https://
  if (url.includes(".")) {
    return `https://${url}`;
  }

  // Se não tem formato reconhecido, retorna vazio (usuário verá erro)
  return "";
};

// Função para validar URL
const isValidUrlFormat = (url: string): boolean => {
  if (!url) return true; // URL vazia é válida (opcional)

  const formatted = formatUrl(url);
  try {
    new URL(formatted);
    return true;
  } catch {
    return false;
  }
};

export default function CreateCarouselPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadError, setUploadError] = useState<string>("");

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError("");

    if (file) {
      // Validação de tipo de arquivo
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setUploadError("Formato inválido. Use apenas JPG, PNG ou WEBP.");
        e.target.value = "";
        return;
      }

      // Validação de tamanho (3MB)
      if (file.size > 3 * 1024 * 1024) {
        setUploadError("A imagem deve ter no máximo 3MB.");
        e.target.value = "";
        return;
      }

      setImageFile(file);

      // Criar preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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

    if (!formData.title || !imageFile) {
      setUploadError(!imageFile ? "Selecione uma imagem" : "Preencha o título");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = "";

      // Upload da imagem
      if (imageFile) {
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

        // Obtém a URL pública
        const {
          data: { publicUrl },
        } = supabase.storage.from("portfolio-images").getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // Determinar a próxima ordem disponível
      const { data: existingItems } = await supabase
        .from("carousel_items")
        .select("order_index")
        .order("order_index", { ascending: false })
        .limit(1);

      const nextOrder =
        existingItems && existingItems.length > 0
          ? existingItems[0].order_index + 1
          : 0;

      // Formata a URL se fornecida
      const formattedLinkUrl = formData.link_url
        ? formatUrl(formData.link_url)
        : null;

      // Insere no banco de dados
      const { error } = await supabase.from("carousel_items").insert([
        {
          title: formData.title,
          description: formData.description,
          image_url: imageUrl,
          link_url: formattedLinkUrl,
          order_index: formData.order_index || nextOrder,
          is_active: formData.is_active,
        },
      ]);

      if (error) throw error;

      alert("Slide criado com sucesso!");
      router.push("/admin/carousel");
      router.refresh();
    } catch (error) {
      console.error("Erro ao criar item:", error);
      setUploadError(
        error instanceof Error
          ? error.message
          : "Erro ao criar item. Tente novamente."
      );
    } finally {
      setLoading(false);
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

    // Limpa erro quando usuário começa a digitar
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
            Adicionar Slide
          </h1>
          <p className="text-neutral-400">
            Crie um novo slide para o carrossel
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700/50">
            <label className="block text-lg font-medium text-white mb-4">
              Imagem do Slide *
            </label>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Preview */}
              <div className="flex-1">
                <div className="aspect-video bg-neutral-700/50 rounded-lg border-2 border-dashed border-neutral-600 overflow-hidden flex items-center justify-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-neutral-400">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                      <p>Nenhuma imagem selecionada</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Selecione uma imagem *
                  </label>
                  <input
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
                  <p>• Recomendado: 1920x1080px (16:9)</p>
                  <p>• Formatos: JPG, PNG, WEBP</p>
                  <p>
                    • Tamanho máximo: <strong>3MB</strong>
                  </p>
                  <p>• A imagem será redimensionada automaticamente</p>
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
                Link do Site (Opcional)
              </label>
              <input
                type="text"
                id="link_url"
                name="link_url"
                value={formData.link_url}
                onChange={handleChange}
                className={cn(
                  "w-full px-4 py-3 bg-neutral-900 border rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                  errors.link_url ? "border-red-500" : "border-neutral-700"
                )}
                placeholder="exemplo.com ou www.exemplo.com (https:// será adicionado automaticamente)"
              />
              {errors.link_url && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.link_url}
                </p>
              )}
              <p className="text-xs text-neutral-500 mt-1">
                Exemplos válidos: site.com, www.site.com, loja.com.br
              </p>
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
                <p className="text-xs text-neutral-500 mt-1">
                  Número que define a ordem dos slides (0 = primeiro)
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
              disabled={loading}
              className={cn(
                "flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg transition-colors",
                loading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-primary-600"
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
                  Salvar Slide
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
