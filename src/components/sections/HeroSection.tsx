'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { CarouselItem } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Carregar dados do Supabase
  useEffect(() => {
    const loadCarouselData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: supabaseError } = await supabase
          .from('carousel_items')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        if (supabaseError) {
          console.error('Erro Supabase:', supabaseError);
          setError('Erro ao conectar com o banco de dados');
          return;
        }

        if (data && data.length > 0) {
          setCarouselItems(data);
        } else {
          // Se não há dados, criar um slide padrão
          setCarouselItems([
            {
              id: 'default',
              title: 'Desenvolvedor Full Stack',
              description: 'Especializado em criar soluções web modernas e escaláveis',
              image_url: '/images/placeholder.png', // Caminho correto
              link_url: null,
              order_index: 0,
              is_active: true,
              created_at: new Date().toISOString(),
            }
          ]);
        }
      } catch (err) {
        console.error('Erro inesperado:', err);
        setError('Erro inesperado ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    loadCarouselData();
  }, [supabase]);

  // Auto-play do carrossel
  useEffect(() => {
    if (carouselItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselItems.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Loading
  if (isLoading) {
    return (
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl font-medium">Carregando carrossel...</p>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600">
        <div className="container text-center text-white">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              Desenvolvedor Full Stack
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Criando soluções digitais inovadoras
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#projetos"
                className="btn btn-primary btn-lg inline-flex items-center gap-2 group"
              >
                Ver Projetos
                <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
              </a>
              <a
                href="#contato"
                className="btn btn-outline btn-lg border-white text-white hover:bg-white hover:text-primary-600"
              >
                Entre em Contato
              </a>
            </div>
            <p className="text-sm opacity-60 mt-8">
              {error} - Usando layout padrão
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Se não há itens (não deveria acontecer por causa do fallback)
  if (carouselItems.length === 0) {
    return (
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600">
        <div className="container text-center text-white">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              Desenvolvedor Full Stack
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Criando soluções digitais inovadoras
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#projetos"
                className="btn btn-primary btn-lg inline-flex items-center gap-2 group"
              >
                Ver Projetos
                <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
              </a>
              <a
                href="#contato"
                className="btn btn-outline btn-lg border-white text-white hover:bg-white hover:text-primary-600"
              >
                Entre em Contato
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentItem = carouselItems[currentSlide];

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={currentItem.image_url}
          alt={currentItem.title}
          fill
          className="object-cover"
          priority
          onError={(e) => {
            console.warn('Erro ao carregar imagem:', currentItem.image_url);
            // Fallback para gradient se imagem não carregar
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 via-primary-800/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container">
          <div className="max-w-3xl">
            <div className="animate-fade-in">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-2xl [text-shadow:_0_4px_12px_rgb(0_0_0_/_80%)]">
                {currentItem.title}
              </h1>
              {currentItem.description && (
                <p className="text-xl md:text-2xl text-white/95 mb-8 leading-relaxed drop-shadow-lg [text-shadow:_0_2px_8px_rgb(0_0_0_/_60%)] bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  {currentItem.description}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#projetos"
                  className="btn btn-primary btn-lg inline-flex items-center gap-2 group shadow-2xl shadow-primary-900/50 backdrop-blur-sm border border-white/20"
                >
                  Ver Projetos
                  <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                </a>
                <a
                  href="#contato"
                  className="btn btn-outline btn-lg border-2 border-white text-white hover:bg-white hover:text-primary-600 backdrop-blur-sm bg-white/10 hover:bg-white shadow-lg shadow-black/30 transition-all"
                >
                  Entre em Contato
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls - Only show if multiple slides */}
      {carouselItems.length > 1 && (
        <>
          {/* Previous/Next Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-all duration-200 text-white hover:scale-110 border border-white/20 shadow-lg"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-6 h-6 drop-shadow-sm" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-all duration-200 text-white hover:scale-110 border border-white/20 shadow-lg"
            aria-label="Próximo slide"
          >
            <ChevronRight className="w-6 h-6 drop-shadow-sm" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            {carouselItems.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  'w-3 h-3 rounded-full transition-all duration-300 shadow-sm',
                  index === currentSlide
                    ? 'bg-white scale-125 shadow-white/50'
                    : 'bg-white/60 hover:bg-white/80'
                )}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-8 z-20 animate-bounce-gentle">
        <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}