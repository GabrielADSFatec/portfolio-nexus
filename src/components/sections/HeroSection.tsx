'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { CarouselItem } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

// Import Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function HeroSection() {
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  
  const swiperRef = useRef<SwiperType | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          setCarouselItems([
            {
              id: 'default',
              title: 'Desenvolvedor Full Stack',
              description: 'Especializado em criar soluções web modernas e escaláveis',
              image_url: '/images/placeholder.png',
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

  const nextSlide = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

  const prevSlide = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  };

  const goToSlide = (index: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(index);
    }
  };

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

  const buttonPosition = windowWidth < 768 ? 'top-2/3' : 'top-1/2';

  return (
    <section className="relative h-screen overflow-hidden isolate carousel-container">
      <Swiper
        modules={[Autoplay, Navigation, Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={1000}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={carouselItems.length > 1}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="h-full w-full"
        allowTouchMove={true}
        grabCursor={true}
        resistance={true}
        resistanceRatio={0.85}
        touchRatio={1}
        touchAngle={45}
        shortSwipes={true}
        longSwipes={true}
        longSwipesRatio={0.1}
        longSwipesMs={300}
        followFinger={true}
        threshold={5}
      >
        {carouselItems.map((item, index) => (
          <SwiperSlide key={item.id} className="relative h-full">
            {/* Background Image */}
            <div className="absolute inset-0 contain-layout">
              <Image
                src={item.image_url}
                alt={item.title}
                fill
                className="object-cover"
                priority={index === 0}
                onError={(e) => {
                  console.warn('Erro ao carregar imagem:', item.image_url);
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 via-primary-800/60 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex items-center">
              <div className="container">
                <div className="max-w-2xl mx-4 md:mx-auto">
                  <div className="animate-fade-in">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 md:mb-12 drop-shadow-2xl [text-shadow:_0_4px_12px_rgb(0_0_0_/_80%)]">
                      {item.title}
                    </h1>
                    {item.description && (
                      <div className="relative mb-8 mt-4 md:mt-16 lg:mt-20">
                        <p className="text-xl md:text-2xl text-white/95 leading-relaxed drop-shadow-lg 
                                    [text-shadow:_0_2px_8px_rgb(0_0_0_/_60%)] bg-black/40 backdrop-blur-sm 
                                    rounded-lg p-4 border border-white/10 max-w-md mx-auto">
                          {item.description}
                        </p>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <a
                        href="#projetos"
                        className="btn btn-primary btn-lg inline-flex items-center gap-2 group shadow-2xl bg-white text-gray-900 hover:bg-gray-100 border-transparent font-semibold"
                      >
                        Ver Projetos
                        <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                      </a>
                      <a
                        href="#contato"
                        className="btn btn-outline btn-lg border-2 border-white text-white bg-gray-900/90 hover:bg-white hover:text-gray-900 backdrop-blur-sm shadow-lg shadow-black/30 transition-all font-semibold"
                      >
                        Entre em Contato
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Controls - Only show if multiple slides */}
      {carouselItems.length > 1 && (
        <>
          {/* Previous/Next Buttons */}
          <button
            onClick={prevSlide}
            className={cn(
              "absolute left-2 z-20 p-2 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-all duration-200 text-white hover:scale-110 border border-white/20 shadow-lg md:left-4",
              buttonPosition,
              "transform -translate-y-1/2"
            )}
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 drop-shadow-sm" />
          </button>

          <button
            onClick={nextSlide}
            className={cn(
              "absolute right-2 z-20 p-2 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-all duration-200 text-white hover:scale-110 border border-white/20 shadow-lg md:right-4",
              buttonPosition,
              "transform -translate-y-1/2"
            )}
            aria-label="Próximo slide"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 drop-shadow-sm" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            {carouselItems.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  'w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 shadow-sm',
                  index === activeIndex
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
      <div className="absolute bottom-8 right-4 z-20 animate-bounce-gentle md:right-8">
        <div className="w-5 h-8 border-2 border-white/60 rounded-full flex justify-center">
          <div className="w-1 h-2 bg-white/60 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}