'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Github, Eye } from 'lucide-react';
import { Project } from '@/types/database';
import { cn } from '@/lib/utils';

// Mock data - será substituído pela chamada ao Supabase
const mockProjects: Project[] = [
  {
    id: '1',
    title: 'E-commerce Moderno',
    description: 'Plataforma completa de vendas online com dashboard administrativo, sistema de pagamentos integrado e gestão de estoque.',
    full_description: 'Descrição completa do projeto...',
    image_url: '/images/placeholder.png',
    technologies: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Prisma', 'PostgreSQL'],
    github_url: 'https://github.com/usuario/ecommerce',
    live_url: 'https://ecommerce-demo.com',
    order_index: 0,
    is_featured: true,
    is_active: true,
    slug: 'ecommerce-moderno',
    created_at: '2024-01-01',
  },
  {
    id: '2',
    title: 'App de Gestão Financeira',
    description: 'Aplicativo para controle de finanças pessoais com relatórios detalhados, gráficos interativos e metas de economia.',
    full_description: 'Descrição completa do projeto...',
    image_url: '/images/placeholder.png',
    technologies: ['React Native', 'Node.js', 'MongoDB', 'Chart.js'],
    github_url: 'https://github.com/usuario/financas-app',
    live_url: null,
    order_index: 1,
    is_featured: true,
    is_active: true,
    slug: 'gestao-financeira',
    created_at: '2024-01-01',
  },
  {
    id: '3',
    title: 'Sistema de Reservas',
    description: 'Plataforma para agendamento e gestão de reservas online com calendário interativo e notificações automáticas.',
    full_description: 'Descrição completa do projeto...',
    image_url: '/images/placeholder.png',
    technologies: ['Vue.js', 'Express.js', 'MySQL', 'Socket.io'],
    github_url: 'https://github.com/usuario/reservas',
    live_url: 'https://reservas-demo.com',
    order_index: 2,
    is_featured: false,
    is_active: true,
    slug: 'sistema-reservas',
    created_at: '2024-01-01',
  },
  {
    id: '4',
    title: 'Blog Pessoal',
    description: 'Blog desenvolvido com foco em performance e SEO, com sistema de comentários e newsletter.',
    full_description: 'Descrição completa do projeto...',
    image_url: '/images/placeholder.png',
    technologies: ['Gatsby', 'GraphQL', 'Contentful', 'Styled Components'],
    github_url: 'https://github.com/usuario/blog',
    live_url: 'https://meu-blog.com',
    order_index: 3,
    is_featured: false,
    is_active: true,
    slug: 'blog-pessoal',
    created_at: '2024-01-01',
  },
];

export default function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'featured'>('all');

  // Simular carregamento de dados do Supabase
  useEffect(() => {
    const loadProjectsData = async () => {
      setIsLoading(true);
      // TODO: Substituir por chamada real ao Supabase
      // const { data, error } = await supabase
      //   .from('projects')
      //   .select('*')
      //   .eq('is_active', true)
      //   .order('order_index', { ascending: true });
      
      setTimeout(() => {
        setProjects(mockProjects);
        setIsLoading(false);
      }, 1000);
    };

    loadProjectsData();
  }, []);

  const filteredProjects = filter === 'featured' 
    ? projects.filter(project => project.is_featured)
    : projects;

  if (isLoading) {
    return (
      <section className="py-20 bg-neutral-50">
        <div className="container">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projetos" className="py-20 bg-neutral-50">
      <div className="container">
        {/* Header da seção */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            Meus <span className="gradient-text">Projetos</span>
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8">
            Uma seleção dos projetos que desenvolvi, demonstrando diferentes tecnologias e abordagens de desenvolvimento.
          </p>

          {/* Filtros */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'px-6 py-3 rounded-lg font-medium transition-all duration-200',
                filter === 'all'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              )}
            >
              Todos os Projetos
            </button>
            <button
              onClick={() => setFilter('featured')}
              className={cn(
                'px-6 py-3 rounded-lg font-medium transition-all duration-200',
                filter === 'featured'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              )}
            >
              Projetos em Destaque
            </button>
          </div>
        </div>

        {/* Grid de projetos */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-neutral-500">Nenhum projeto encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div key={project.id} className="group">
                <div className="card-hover p-0 overflow-hidden h-full flex flex-col">
                  {/* Imagem do projeto */}
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={project.image_url}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {project.is_featured && (
                      <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Destaque
                      </div>
                    )}
                    
                    {/* Overlay com links */}
                    <div className="absolute inset-0 bg-primary-900/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4">
                      <Link
                        href={`/projeto/${project.slug}`}
                        className="p-3 bg-white rounded-full text-primary-600 hover:bg-primary-50 transition-colors"
                        title="Ver detalhes do projeto"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-white rounded-full text-primary-600 hover:bg-primary-50 transition-colors"
                          title="Ver código no GitHub"
                        >
                          <Github className="w-5 h-5" />
                        </a>
                      )}
                      
                      {project.live_url && (
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-white rounded-full text-primary-600 hover:bg-primary-50 transition-colors"
                          title="Ver projeto online"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Conteúdo do card */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-semibold text-neutral-900 mb-3 group-hover:text-primary-600 transition-colors">
                      {project.title}
                    </h3>
                    
                    <p className="text-neutral-600 mb-4 line-clamp-3 flex-1">
                      {project.description}
                    </p>

                    {/* Tecnologias */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-sm font-medium">
                          +{project.technologies.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Botão Ver Mais */}
                    <Link
                      href={`/projeto/${project.slug}`}
                      className="btn btn-outline w-full group/btn"
                    >
                      Ver Mais
                      <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <p className="text-lg text-neutral-600 mb-6">
            Gostou do que viu? Vamos conversar sobre seu próximo projeto!
          </p>
          <Link
            href="#contato"
            className="btn btn-primary btn-lg"
          >
            Entrar em Contato
          </Link>
        </div>
      </div>
    </section>
  );
}