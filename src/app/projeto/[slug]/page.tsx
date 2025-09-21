import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Github, Calendar, Tag, Code, Zap, Users } from 'lucide-react';
import { Project } from '@/types/database';
import { formatDate, cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';
import ProjectImageGallery from '@/components/ui/ProjectImageGallery';

interface ProjectPageProps {
  params: {
    slug: string;
  };
}

// Função real para buscar projeto do Supabase
async function getProject(slug: string): Promise<Project | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      images:project_images(
        id,
        image_url,
        image_alt,
        display_order
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .eq('project_images.is_active', true)
    .order('display_order', { foreignTable: 'project_images', ascending: true })
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

// Função para buscar projetos relacionados
async function getRelatedProjects(currentProjectId: string, limit: number = 3): Promise<Project[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      slug,
      description,
      image_url,
      technologies,
      github_url,
      live_url,
      order_index,
      is_featured,
      is_active,
      created_at
    `)
    .neq('id', currentProjectId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  return data || [];
}

// Generate metadata
export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = await getProject(params.slug);

  if (!project) {
    return {
      title: 'Projeto não encontrado',
    };
  }

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: [project.image_url],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = await getProject(params.slug);

  if (!project) {
    notFound();
  }

  const relatedProjects = await getRelatedProjects(project.id);

  return (
    <main className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-neutral-50 to-primary-50/30">
        <div className="container">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-8">
            <Link 
              href="/"
              className="hover:text-primary-600 transition-colors"
            >
              Início
            </Link>
            <span>/</span>
            <Link 
              href="/#projetos"
              className="hover:text-primary-600 transition-colors"
            >
              Projetos
            </Link>
            <span>/</span>
            <span className="text-neutral-900 font-medium">{project.title}</span>
          </div>

          {/* Back button */}
          <Link
            href="/#projetos"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar aos Projetos
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Project Info */}
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <h1 className="text-4xl md:text-5xl font-bold text-neutral-900">
                  {project.title}
                </h1>
                {project.is_featured && (
                  <span className="px-3 py-1 bg-gradient-primary text-white rounded-full text-sm font-medium shadow-md">
                    ⭐ Destaque
                  </span>
                )}
              </div>

              <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
                {project.description}
              </p>

              {/* Project Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-200">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <div>
                    <div className="text-sm text-neutral-500">Criado em</div>
                    <div className="font-medium">{formatDate(project.created_at)}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-200">
                  <Code className="w-5 h-5 text-secondary-600" />
                  <div>
                    <div className="text-sm text-neutral-500">Tecnologias</div>
                    <div className="font-medium">{project.technologies.length} utilizadas</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {project.live_url && (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-lg inline-flex items-center gap-2 group shadow-lg shadow-primary-600/25"
                  >
                    <Zap className="w-5 h-5" />
                    Ver Projeto Online
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                )}

                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-lg inline-flex items-center gap-2 group"
                  >
                    <Github className="w-5 h-5" />
                    Ver Código
                  </a>
                )}
              </div>

              {/* Technologies */}
              <div>
                <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Tecnologias Utilizadas
                </h3>
                <div className="flex flex-wrap gap-3">
                  {project.technologies.map((tech, index) => (
                    <span
                      key={tech}
                      className={cn(
                        "px-4 py-2 rounded-lg font-medium text-sm shadow-sm",
                        index % 3 === 0 && "bg-primary-50 text-primary-700 border border-primary-200",
                        index % 3 === 1 && "bg-secondary-50 text-secondary-700 border border-secondary-200",
                        index % 3 === 2 && "bg-green-50 text-green-700 border border-green-200"
                      )}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Project Gallery */}
            <div className="relative animate-fade-in lg:animate-slide-in-right">
              <ProjectImageGallery 
                images={project.images || [{ 
                  id: '1', 
                  image_url: project.image_url, 
                  image_alt: project.title,
                  display_order: 0,
                  project_id: project.id,
                  is_active: true,
                  created_at: project.created_at
                }]} 
                projectTitle={project.title}
              />
              
              {/* Floating badges */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-lg border border-neutral-200">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-neutral-900">Projeto Real</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Details */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">
              Detalhes do Projeto
            </h2>
            
            {project.full_description ? (
              <div 
                className="prose prose-lg prose-neutral max-w-none prose-headings:text-neutral-900 prose-headings:font-semibold prose-a:text-primary-600 prose-strong:text-neutral-900"
                dangerouslySetInnerHTML={{ __html: project.full_description }}
              />
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code className="w-8 h-8 text-neutral-400" />
                </div>
                <p className="text-neutral-500">
                  Descrição detalhada em breve...
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="py-20 bg-neutral-50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">
                Outros Projetos
              </h2>
              <p className="text-neutral-600">
                Confira outros trabalhos que desenvolvi
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProjects.map((relatedProject, index) => (
                <div 
                  key={relatedProject.id}
                  className="group animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="card-hover p-0 overflow-hidden h-full flex flex-col">
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={relatedProject.image_url}
                        alt={relatedProject.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-semibold text-neutral-900 mb-3 group-hover:text-primary-600 transition-colors">
                        {relatedProject.title}
                      </h3>
                      <p className="text-neutral-600 mb-4 line-clamp-3 flex-1">
                        {relatedProject.description}
                      </p>
                      <Link
                        href={`/projeto/${relatedProject.slug}`}
                        className="btn btn-outline w-full group/btn"
                      >
                        Ver Projeto
                        <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/#projetos"
                className="btn btn-primary btn-lg"
              >
                Ver Todos os Projetos
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}