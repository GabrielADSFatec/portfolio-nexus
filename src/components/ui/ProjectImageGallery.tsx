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

  // Se não houver imagens, mostrar placeholder
  const displayImages = images.length > 0 ? images : [
    {
      id: 'placeholder',
      image_url: '/assets/placeholder.png',
      image_alt: projectTitle,
      display_order: 0,
      project_id: '',
      is_active: true,
      created_at: ''
    }
  ];

  const currentImage = displayImages[currentImageIndex];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Main Gallery */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative aspect-video lg:aspect-square rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary-100 to-secondary-100 group">
          <Image
            src={currentImage.image_url}
            alt={currentImage.image_alt || projectTitle}
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
          <div className="relative max-w-7xl max-h-full">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 text-white hover:text-neutral-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Modal Image */}
            <div className="relative w-full h-full max-w-5xl max-h-[80vh]">
              <Image
                src={currentImage.image_url}
                alt={currentImage.image_alt || projectTitle}
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
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Modal counter */}
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