'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { CarouselItem } from '@/types/database';
import { cn } from '@/lib/utils';

// Mock data - será substituído pela chamada ao Supabase
const mockCarouselItems: CarouselItem[] = [
	{
		id: '1',
		title: 'Desenvolvedor Full Stack',
		description:
			'Especializado em criar soluções web modernas e escaláveis com as melhores tecnologias',
		image_url: '/images/placeholder.png', // alterado para public/images
		link_url: null,
		order_index: 0,
		is_active: true,
		created_at: '2024-01-01',
	},
	{
		id: '2',
		title: 'Experiência em React & Next.js',
		description:
			'Criando interfaces modernas e performáticas com foco na experiência do usuário',
		image_url: '/images/placeholder.png', // alterado para public/images
		link_url: null,
		order_index: 1,
		is_active: true,
		created_at: '2024-01-01',
	},
	{
		id: '3',
		title: 'Soluções Backend Robustas',
		description:
			'APIs escaláveis e bancos de dados otimizados para performance e segurança',
		image_url: '/images/placeholder.png', // alterado para public/images
		link_url: null,
		order_index: 2,
		is_active: true,
		created_at: '2024-01-01',
	},
];

export default function HeroSection() {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Simular carregamento de dados do Supabase
	useEffect(() => {
		const loadCarouselData = async () => {
			setIsLoading(true);
			// TODO: Substituir por chamada real ao Supabase
			// const { data, error } = await supabase
			//   .from('carousel_items')
			//   .select('*')
			//   .eq('is_active', true)
			//   .order('order_index', { ascending: true });

			setTimeout(() => {
				setCarouselItems(mockCarouselItems);
				setIsLoading(false);
			}, 1000);
		};

		loadCarouselData();
	}, []);

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

	if (isLoading) {
		return (
			<section className="relative h-screen flex items-center justify-center gradient-hero">
				<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
			</section>
		);
	}

	if (carouselItems.length === 0) {
		return (
			<section className="relative h-screen flex items-center justify-center gradient-hero text-white">
				<div className="text-center">
					<h1 className="text-4xl md:text-6xl font-bold mb-4">
						Desenvolvedor Full Stack
					</h1>
					<p className="text-xl md:text-2xl opacity-90">
						Criando soluções digitais inovadoras
					</p>
				</div>
			</section>
		);
	}

	const currentItem = carouselItems[currentSlide];

	return (
		<section className="relative h-screen overflow-hidden">
			{/* Background com imagem do slide atual */}
			<div className="absolute inset-0">
				<Image
					src={currentItem.image_url}
					alt={currentItem.title}
					fill
					className="object-cover"
					priority
				/>
				<div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 via-primary-800/60 to-transparent" />
			</div>

			{/* Conteúdo */}
			<div className="relative z-10 h-full flex items-center">
				<div className="container">
					<div className="max-w-3xl">
						<div className="animate-fade-in">
							<h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 text-shadow-lg">
								{currentItem.title}
							</h1>
							{currentItem.description && (
								<p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
									{currentItem.description}
								</p>
							)}
							<div className="flex flex-col sm:flex-row gap-4">
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
				</div>
			</div>

			{/* Controles do Carrossel */}
			{carouselItems.length > 1 && (
				<>
					{/* Botões de navegação */}
					<button
						onClick={prevSlide}
						className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 text-white hover:scale-110"
						aria-label="Slide anterior"
					>
						<ChevronLeft className="w-6 h-6" />
					</button>

					<button
						onClick={nextSlide}
						className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 text-white hover:scale-110"
						aria-label="Próximo slide"
					>
						<ChevronRight className="w-6 h-6" />
					</button>

					{/* Indicadores */}
					<div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
						{carouselItems.map((_, index) => (
							<button
								key={index}
								onClick={() => goToSlide(index)}
								className={cn(
									'w-3 h-3 rounded-full transition-all duration-300',
									index === currentSlide
										? 'bg-white scale-125'
										: 'bg-white/50 hover:bg-white/75'
								)}
								aria-label={`Ir para slide ${index + 1}`}
							/>
						))}
					</div>
				</>
			)}

			{/* Scroll indicator */}
			<div className="absolute bottom-8 right-8 z-20 animate-bounce-gentle">
				<div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
					<div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
				</div>
			</div>
		</section>
	);
}