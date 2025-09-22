'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Star, Trophy, Users } from 'lucide-react';
import { Client } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export default function ClientsSection() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const loadClientsData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: supabaseError } = await supabase
          .from('clients')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        if (supabaseError) {
          console.error('Erro ao carregar clientes:', supabaseError);
          setError('Erro ao carregar clientes');
          return;
        }

        if (data) {
          setClients(data);
        }
      } catch (err) {
        console.error('Erro inesperado:', err);
        setError('Erro inesperado ao carregar clientes');
      } finally {
        setIsLoading(false);
      }
    };

    loadClientsData();
  }, [supabase]);

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="clientes" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container">
        {/* Header da seção */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Trophy className="w-4 h-4" />
            Parcerias de Sucesso
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Clientes que <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Confiam</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Colaboramos com empresas e pessoas visionárias que valorizam excelência, 
            inovação e resultados extraordinários.
          </p>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="text-center py-8 bg-red-50 rounded-2xl mb-8 border border-red-100">
            <p className="text-red-600 font-medium">{error}</p>
            <p className="text-sm text-red-500 mt-2">
              Verifique sua conexão e tente novamente.
            </p>
          </div>
        )}

        {clients.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg text-gray-500 font-medium">Nenhum cliente cadastrado</p>
            <p className="text-gray-400 mt-1">
              Painel admin
            </p>
          </div>
        ) : (
          <>
            {/* Grid de clientes */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-16">
              {clients.map((client, index) => (
                <div
                  key={client.id}
                  className={cn(
                    'group relative bg-white rounded-2xl p-4 hover:shadow-xl transition-all duration-500 flex flex-col aspect-square',
                    'border border-gray-100 hover:border-blue-100',
                    'animate-fade-in hover:scale-105'
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Card Content */}
                  <div className="flex-1 flex flex-col">
                    {/* Image Container - Mais espaço para a imagem */}
                    <div className="relative flex-1 mb-3 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                      {client.website_url ? (
                        <a
                          href={client.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative w-full h-full flex items-center justify-center group/link"
                          title={`Visitar ${client.name}`}
                        >
                          <Image
                            src={client.logo_url || '/images/placeholder.png'}
                            alt={`Logo ${client.name}`}
                            fill
                            className="object-contain p-3 transition-all duration-500 group-hover/link:scale-110"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                            onError={(e) => {
                              console.warn('Erro ao carregar logo do cliente:', client.logo_url);
                              const target = e.target as HTMLImageElement;
                              target.src = '/images/placeholder.png';
                            }}
                          />
                          
                          {/* Overlay e ícone de link */}
                          <div className="absolute inset-0 bg-blue-600/0 group-hover/link:bg-blue-600/5 transition-all duration-300" />
                          <div className="absolute top-2 right-2 opacity-0 group-hover/link:opacity-100 transition-all duration-300">
                            <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-lg">
                              <ExternalLink className="w-3 h-3" />
                            </div>
                          </div>
                        </a>
                      ) : (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <Image
                            src={client.logo_url || '/images/placeholder.png'}
                            alt={`Logo ${client.name}`}
                            fill
                            className="object-contain p-3"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                            onError={(e) => {
                              console.warn('Erro ao carregar logo do cliente:', client.logo_url);
                              const target = e.target as HTMLImageElement;
                              target.src = '/images/placeholder.png';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Client Info */}
                    <div className="text-center px-2">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                        {client.name}
                      </h3>
                      {client.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 leading-tight">
                          {client.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tooltip refinado */}
                  {client.description && client.description.length > 60 && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 w-48">
                      <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl border border-gray-800">
                        <div className="font-semibold mb-1 text-white">{client.name}</div>
                        <div className="text-gray-300 leading-relaxed">
                          {client.description}
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Estatísticas melhoradas */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-2xl p-8 md:p-12 text-white shadow-xl mb-16">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Users className="w-8 h-8 text-blue-200" />
                    <div className="text-left">
                      <div className="text-3xl md:text-4xl font-bold">{clients.length}+</div>
                      <div className="text-blue-200 text-sm font-medium">Clientes Satisfeitos</div>
                    </div>
                  </div>
                </div>

                <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Trophy className="w-8 h-8 text-purple-200" />
                    <div className="text-left">
                      <div className="text-3xl md:text-4xl font-bold">10+</div>
                      <div className="text-purple-200 text-sm font-medium">Projetos Entregues</div>
                    </div>
                  </div>
                </div>

                <div className="animate-fade-in" style={{ animationDelay: '600ms' }}>
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Star className="w-8 h-8 text-yellow-200" />
                    <div className="text-left">
                      <div className="text-3xl md:text-4xl font-bold">99%</div>
                      <div className="text-yellow-200 text-sm font-medium">Taxa de Satisfação</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial refinado */}
            <div className="text-center max-w-4xl mx-auto mb-16">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current mx-0.5" />
                  ))}
                </div>
                <blockquote className="text-xl md:text-2xl font-light text-gray-700 italic mb-4 leading-relaxed">
                  &quot;A dedicação em entender nossas necessidades e entregar resultados excepcionais 
                  fez toda diferença no sucesso dos nossos projetos.&quot;
                </blockquote>
                <div className="text-blue-600 font-semibold">
                  — Depoimento de Cliente Satisfeito
                </div>
              </div>
            </div>
          </>
        )}

        {/* Call to Action melhorado */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Pronto para fazer parte desta lista?
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Vamos criar algo extraordinário juntos. Sua próxima história de sucesso começa aqui.
            </p>
            <Link
              href="#contato"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              Iniciar Projeto
              <Trophy className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}