'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Upload, X, GripVertical, Edit3, Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GalleryImage {
  id?: string;
  file: File | null;
  preview: string;
  alt: string;
  order: number;
  is_new?: boolean;
}

interface ImageGalleryManagerProps {
  images: GalleryImage[];
  onImagesChange: (images: GalleryImage[]) => void;
  maxImages?: number;
}

export default function ImageGalleryManager({
  images,
  onImagesChange,
  maxImages = 10
}: ImageGalleryManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleFileUpload = (files: FileList) => {
    const newImages: GalleryImage[] = [];
    
    Array.from(files).forEach((file, index) => {
      if (images.length + newImages.length >= maxImages) return;
      
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        newImages.push({
          file,
          preview,
          alt: '',
          order: images.length + newImages.length,
          is_new: true
        });
      }
    });

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
      .map((img, i) => ({ ...img, order: i }));
    onImagesChange(newImages);
  };

  const updateImageAlt = (index: number, alt: string) => {
    const newImages = [...images];
    newImages[index].alt = alt;
    onImagesChange(newImages);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newImages = [...images];
    const [draggedItem] = newImages.splice(draggedIndex, 1);
    newImages.splice(targetIndex, 0, draggedItem);

    // Atualizar ordens
    const reorderedImages = newImages.map((img, index) => ({
      ...img,
      order: index
    }));

    onImagesChange(reorderedImages);
    setDraggedIndex(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-neutral-300">
          Galeria de Imagens <span className="text-neutral-500 text-xs">({images.length}/{maxImages})</span>
        </label>
        
        <label className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg cursor-pointer hover:bg-primary-600 transition-colors">
          <Plus className="w-4 h-4" />
          Adicionar Imagens
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={images.length >= maxImages}
          />
        </label>
      </div>

      {images.length === 0 ? (
        <div className="border-2 border-dashed border-neutral-600 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-400">Nenhuma imagem na galeria</p>
          <p className="text-neutral-500 text-sm mt-1">
            Adicione até {maxImages} imagens para a galeria do projeto
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id || `new-${index}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              className={cn(
                "bg-neutral-800/50 rounded-lg border border-neutral-700/50 p-4 transition-all",
                draggedIndex === index ? "opacity-50" : "hover:border-neutral-600/50"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Handle para drag */}
                <div className="flex items-center justify-center h-12 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-5 h-5 text-neutral-400" />
                </div>

                {/* Preview da imagem */}
                <div className="relative w-16 h-12 bg-neutral-700 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={image.preview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Controles */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-neutral-700 text-neutral-300 rounded text-xs">
                      #{image.order + 1}
                    </span>
                    {image.is_new && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                        Novo
                      </span>
                    )}
                  </div>

                  <input
                    type="text"
                    value={image.alt}
                    onChange={(e) => updateImageAlt(index, e.target.value)}
                    placeholder="Descrição da imagem (alt text)..."
                    className="w-full px-3 py-1 bg-neutral-900 border border-neutral-700 rounded text-sm text-white placeholder-neutral-500"
                  />
                </div>

                {/* Botão de remover */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length >= maxImages && (
        <div className="text-center text-neutral-500 text-sm">
          Limite máximo de {maxImages} imagens atingido
        </div>
      )}
    </div>
  );
}