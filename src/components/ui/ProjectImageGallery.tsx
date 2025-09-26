'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { ProjectImage } from '@/types/database';
import { cn } from '@/lib/utils';

interface ProjectImageGalleryProps {
  images: ProjectImage[];
  projectTitle: string;
}

export default function ProjectImageGallery({ images, projectTitle }: ProjectImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // CORREÇÃO: Sempre incluir a imagem principal mesmo se não houver imagens adicionais
  const displayImages = images.length > 0 ? images : [];

  // Se não houver imagens, mostrar placeholder
  const hasImages = displayImages.length > 0;

  const currentImage = hasImages ? displayImages[currentImageIndex] : null;

  const nextImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
    }
  };

  const prevImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // CORREÇÃO: Se não há imagens, mostrar mensagem
  if (!hasImages) {
    return (
      <div className="relative aspect-video lg:aspect-square rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <ZoomIn className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Nenhuma imagem disponível
          </h3>
          <p className="text-gray-600">
            Este projeto não possui imagens cadastradas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Gallery */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative aspect-video lg:aspect-square rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary-100 to-secondary-100 group">
          <Image
            src={currentImage!.image_url}
            alt={currentImage!.image_alt || projectTitle}
            fill
            className="object-cover hover:scale-105 transition-transform duration-700"
            priority
          />
          
          {/* Overlay com zoom */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <button
              onClick={openModal}
              className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 hover:bg-white text-neutral-900 p-3 rounded-full shadow-lg transform scale-90 hover:scale-100"
            >
              <ZoomIn className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Arrows (apenas se houver múltiplas imagens) */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-neutral-900 p-2 rounded-full shadow-lg transition-all hover:scale-110"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-neutral-900 p-2 rounded-full shadow-lg transition-all hover:scale-110"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Image counter */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {displayImages.length}
            </div>
          )}
        </div>

        {/* Thumbnail Navigation (apenas se houver múltiplas imagens) */}
        {displayImages.length > 1 && (
          <div className="flex gap-2 justify-center">
            {displayImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setCurrentImageIndex(index)}
                className={cn(
                  "relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                  index === currentImageIndex
                    ? "border-primary-500 shadow-md scale-105"
                    : "border-neutral-200 hover:border-primary-300 opacity-70 hover:opacity-100"
                )}
              >
                <Image
                  src={image.image_url}
                  alt={image.image_alt || `${projectTitle} - Imagem ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Zoom */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-full w-full">
            {/* Close button - CORREÇÃO: Posicionamento melhorado */}
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 text-white hover:text-neutral-300 transition-colors z-10 bg-black/50 rounded-full p-2"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Image - CORREÇÃO: Melhor centralização */}
            <div className="relative w-full h-full max-w-5xl max-h-[80vh] flex items-center justify-center mx-auto">
              <Image
                src={currentImage!.image_url}
                alt={currentImage!.image_alt || projectTitle}
                width={1200}
                height={800}
                className="w-full h-full object-contain rounded-lg"
                priority
              />
            </div>

            {/* Modal Navigation (se houver múltiplas imagens) */}
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Modal counter - CORREÇÃO: Posicionamento melhorado */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full">
                  {currentImageIndex + 1} de {displayImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}