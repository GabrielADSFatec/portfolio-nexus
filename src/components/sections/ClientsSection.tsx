'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Client } from '@/types/database';
import { cn } from '@/lib/utils';

// Mock data - será substituído pela chamada ao Supabase
const mockClients: Client[] = [
  {
    id: '1',
    name: 'TechCorp Solutions',
    logo_url: '/images/placeholder.png', // atualizado
    website_url: 'https://techcorp.com',
    description: 'Empresa de tecnologia focada em soluções empresariais',
    order_index: 0,
    is_active: true,
    created_at: '2024-01-01',
  },
  {
    id: '2',
    name: 'StartupXYZ',
    logo_url: '/images/placeholder.png', // atualizado
    website_url: 'https://startupxyz.com',
    description: 'Startup inovadora no setor de fintech',
    order_index: 1,
    is_active: true,
    created_at: '2024-01-01',
  },
  {
    id: '3',
    name: 'Digital Agency',
    logo_url: '/images/placeholder.png', // atualizado
    website_url: 'https://digitalagency.com',
    description: 'Agência digital especializada em marketing online',
    order_index: 2,
    is_active: true,
    created_at: '2024-01-01',
  },
  {
    id: '4',
    name: 'E-commerce Plus',
    logo_url: '/images/placeholder.png', // atualizado
    website_url: 'https://ecommerceplus.com',
    description: 'Plataforma de e-commerce para pequenas empresas',
    order_index: 3,
    is_active: true,
    created_at: '2024-01-01',
  },
  {
    id: '5',
    name: 'HealthTech',
    logo_url: '/images/placeholder.png', // atualizado
    website_url: 'https://healthtech.com',
    description: 'Tecnologia aplicada à área da saúde',
    order_index: 4,
    is_active: true,
    created_at: '2024-01-01',
  },
  {
    id: '6',
    name: 'EduPlatform',
    logo_url: '/images/placeholder.png', // atualizado
    website_url: 'https://eduplatform.com',
    description: 'Plataforma educacional online',
    order_index: 5,
    is_active: true,
    created_at: '2024-01-01',
  },
];

export default function ClientsSection() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simular carregamento de dados do Supabase
  useEffect(() => {
    const loadClientsData = async () => {
      setIsLoading(true);
      // TODO: Substituir por chamada real ao Supabase
      // const { data, error } = await supabase
      //   .from('clients')
      //   .select('*')
      //   .eq('is_active', true)
      //   .order('order_index', { ascending: true });
      
      setTimeout(() => {
        setClients(mockClients);
        setIsLoading(false);
      }, 1000);
    };

    loadClientsData();
  }, []);

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="container">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="clientes" className="py-20 bg-white">
      <div className="container">
        {/* Header da seção */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            Clientes que <span className="gradient-text">Confiam</span>
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Tenho orgulho de trabalhar com empresas que valorizam qualidade, inovação e resultados excepcionais.
          </p>
        </div>

        {clients.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-neutral-500">Nenhum cliente cadastrado.</p>
          </div>
        ) : (
          <>
            {/* Grid de clientes */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16">
              {clients.map((client, index) => (
                <div
                  key={client.id}
                  className={cn(
                    'group relative bg-neutral-50 rounded-xl p-6 hover:bg-white hover:shadow-lg transition-all duration-300 flex items-center justify-center aspect-square',
                    'animate-fade-in'
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {client.website_url ? (
                    <a
                      href={client.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative w-full h-full flex items-center justify-center group/link"
                      title={`Visitar ${client.name}`}
                    >
                      <Image
                        src={client.logo_url}
                        alt={`Logo ${client.name}`}
                        fill
                        className="object-contain p-4 filter grayscale group-hover:grayscale-0 transition-all duration-300 group-hover/link:scale-110"
                      />
                      <div className="absolute inset-0 bg-primary-600/0 group-hover/link:bg-primary-600/5 rounded-xl transition-all duration-300" />
                      <ExternalLink className="absolute top-2 right-2 w-4 h-4 text-neutral-400 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                    </a>
                  ) : (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <Image
                        src={client.logo_url}
                        alt={`Logo ${client.name}`}
                        fill
                        className="object-contain p-4 filter grayscale group-hover:grayscale-0 transition-all duration-300"
                      />
                    </div>
                  )}

                  {/* Tooltip com nome e descrição */}
                  {client.description && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10">
                      <div className="bg-neutral-900 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap max-w-xs">
                        <div className="font-semibold">{client.name}</div>
                        <div className="text-neutral-300 text-xs mt-1">{client.description}</div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-900"></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Estatísticas */}
            <div className="bg-gradient-primary rounded-2xl p-8 md:p-12 text-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                  <div className="text-4xl md:text-5xl font-bold mb-2">
                    {clients.length}+
                  </div>
                  <div className="text-white/90 text-lg">
                    Clientes Satisfeitos
                  </div>
                </div>

                <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
                  <div className="text-4xl md:text-5xl font-bold mb-2">
                    50+
                  </div>
                  <div className="text-white/90 text-lg">
                    Projetos Entregues
                  </div>
                </div>

                <div className="animate-fade-in" style={{ animationDelay: '600ms' }}>
                  <div className="text-4xl md:text-5xl font-bold mb-2">
                    99%
                  </div>
                  <div className="text-white/90 text-lg">
                    Taxa de Satisfação
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial (pode ser expandido futuramente) */}
            <div className="mt-16 text-center">
              <blockquote className="text-2xl md:text-3xl font-light text-neutral-700 italic mb-6 max-w-4xl mx-auto">
                "Trabalhar com profissionais dedicados que entendem nossas necessidades e entregam resultados excepcionais faz toda a diferença no sucesso dos nossos projetos."
              </blockquote>
              <div className="text-primary-600 font-semibold">
                Depoimento de nossos clientes
              </div>
            </div>
          </>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <p className="text-lg text-neutral-600 mb-6">
            Quer fazer parte desta lista de clientes satisfeitos?
          </p>
          <Link
            href="#contato"
            className="btn btn-primary btn-lg"
          >
            Vamos Trabalhar Juntos
          </Link>
        </div>
      </div>
    </section>
  );
}