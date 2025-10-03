'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadWithPreviewProps {
  onImageChange: (file: File | null) => void;
  previewUrl?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'auto';
  maxSize?: number;
  allowedTypes?: string[];
  label?: string;
  required?: boolean;
  canRemove?: boolean;
}

export default function ImageUploadWithPreview({
  onImageChange,
  previewUrl,
  className,
  aspectRatio = 'square',
  maxSize = 3 * 1024 * 1024, // 3MB
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  label = 'Imagem',
  required = false,
  canRemove = true
}: ImageUploadWithPreviewProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFile = useCallback((file: File) => {
    // Validação de tipo
    if (!allowedTypes.includes(file.type)) {
      setError(`Formato inválido. Use: ${allowedTypes.join(', ')}`);
      return false;
    }

    // Validação de tamanho
    if (file.size > maxSize) {
      setError(`A imagem deve ter no máximo ${maxSize / 1024 / 1024}MB`);
      return false;
    }

    setError('');
    onImageChange(file);
    return true;
  }, [allowedTypes, maxSize, onImageChange]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageChange(null);
    setError('');
  };

  const aspectRatioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: 'aspect-auto'
  }[aspectRatio];

  return (
    <div className={cn('space-y-3', className)}>
      <label className="block text-sm font-medium text-neutral-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>

      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg transition-all overflow-hidden',
          aspectRatioClass,
          dragActive 
            ? 'border-primary-500 bg-primary-500/10' 
            : 'border-neutral-600 hover:border-neutral-500',
          error ? 'border-red-500' : '',
          !previewUrl ? 'cursor-pointer' : ''
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={allowedTypes.join(',')}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        {previewUrl ? (
          <div className="relative w-full h-full">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-cover"
            />
            {canRemove && (
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <Upload className="w-8 h-8 text-neutral-400 mb-2" />
            <p className="text-neutral-400 text-sm">
              Arraste uma imagem ou clique para selecionar
            </p>
            <p className="text-neutral-500 text-xs mt-1">
              {allowedTypes.join(', ')} • Máx. {maxSize / 1024 / 1024}MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}