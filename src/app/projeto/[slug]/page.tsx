import { Metadata, Viewport } from 'next';
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
    .select('*')
    .neq('id', currentProjectId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  return data || [];
}

// Generate metadata
export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);

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

// Generate viewport - CORREÇÃO CRÍTICA
export async function generateViewport({ params }: ProjectPageProps): Promise<Viewport> {
  return {
    themeColor: '#3b82f6',
    width: 'device-width',
    initialScale: 1,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

  const relatedProjects = await getRelatedProjects(project.id);

  return (
    <main className="min-h-screen pt-20 bg-neutral-50">
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20">
        <div className="container">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-8">
            <Link 
              href="/"
              className="hover:text-neutral-800 transition-colors font-medium"
            >
              Início
            </Link>
            <span className="text-neutral-400">/</span>
            <Link 
              href="/#projetos"
              className="hover:text-neutral-800 transition-colors font-medium"
            >
              Projetos
            </Link>
            <span className="text-neutral-400">/</span>
            <span className="text-neutral-800 font-semibold">{project.title}</span>
          </div>

          {/* Back button */}
          <Link
            href="/#projetos"
            className="inline-flex items-center gap-2 text-white hover:text-neutral-100 font-semibold mb-8 group bg-neutral-800 hover:bg-neutral-700 px-6 py-3 rounded-lg shadow-md border border-neutral-600 hover:shadow-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar aos Projetos
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Project Info */}
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 leading-tight">
                  {project.title}
                </h1>
                {project.is_featured && (
                  <span className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                    <span>⭐</span>
                    Destaque
                  </span>
                )}
              </div>

              <p className="text-xl text-neutral-700 mb-8 leading-relaxed font-medium">
                {project.description}
              </p>

              {/* Project Meta Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-700" />
                    </div>
                    <div>
                      <div className="text-sm text-neutral-600 font-medium">Criado em</div>
                      <div className="text-lg font-semibold text-neutral-900">{formatDate(project.created_at)}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Code className="w-6 h-6 text-emerald-700" />
                    </div>
                    <div>
                      <div className="text-sm text-neutral-600 font-medium">Tecnologias</div>
                      <div className="text-lg font-semibold text-neutral-900">{project.technologies.length} utilizadas</div>
                    </div>
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
                    className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all group"
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
                    className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-neutral-900 text-neutral-800 hover:text-white font-semibold rounded-lg border-2 border-neutral-800 hover:border-neutral-900 transition-all group"
                  >
                    <Github className="w-5 h-5" />
                    Ver Código
                  </a>
                )}
              </div>

              {/* Technologies */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
                <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2 text-lg">
                  <Tag className="w-5 h-5 text-neutral-700" />
                  Tecnologias Utilizadas
                </h3>
                <div className="flex flex-wrap gap-3">
                  {project.technologies.map((tech, index) => (
                    <span
                      key={tech}
                      className={cn(
                        "px-4 py-2 rounded-lg font-semibold text-sm shadow-sm border transition-all hover:scale-105",
                        index % 4 === 0 && "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200",
                        index % 4 === 1 && "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200",
                        index % 4 === 2 && "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200",
                        index % 4 === 3 && "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200"
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
              
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-4 shadow-lg text-white">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Users className="w-4 h-4" />
                  <span>Projeto Real</span>
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
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Detalhes do Projeto
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full"></div>
            </div>
            
            {project.full_description ? (
              <div className="bg-black rounded-2xl shadow-lg border border-neutral-200 p-8 md:p-12">
                <div 
                  className="prose prose-lg prose-neutral max-w-none 
                           prose-headings:text-neutral-900 prose-headings:font-bold prose-headings:text-2xl
                           prose-p:text-neutral-900 prose-p:leading-relaxed prose-p:text-lg prose-p:font-medium
                           prose-a:text-blue-700 prose-a:hover:text-blue-800 prose-a:font-semibold prose-a:underline
                           prose-strong:text-neutral-900 prose-strong:font-bold
                           prose-ul:text-neutral-900 prose-li:text-neutral-900 prose-li:font-medium prose-li:text-lg
                           prose-ol:text-neutral-900 prose-ol:font-medium
                           prose-blockquote:text-neutral-800 prose-blockquote:border-l-blue-600 prose-blockquote:bg-blue-50 prose-blockquote:p-4 prose-blockquote:rounded-r
                           prose-code:text-indigo-800 prose-code:bg-indigo-100 prose-code:px-3 prose-code:py-1 prose-code:rounded prose-code:font-semibold
                           prose-pre:bg-neutral-900 prose-pre:text-white
                           prose-hr:border-neutral-300"
                  dangerouslySetInnerHTML={{ __html: project.full_description }}
                />
              </div>
            ) : (
              <div className="text-center py-16 bg-neutral-100 rounded-2xl border border-neutral-300">
                <div className="w-20 h-20 bg-neutral-300 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Code className="w-10 h-10 text-neutral-700" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Descrição Detalhada
                </h3>
                <p className="text-neutral-800 font-medium">
                  A descrição completa deste projeto será adicionada em breve...
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-neutral-50 to-blue-50/30">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Outros Projetos
              </h2>
              <p className="text-xl text-neutral-700 max-w-2xl mx-auto">
                Confira outros trabalhos desenvolvidos!
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-emerald-600 to-teal-600 mx-auto rounded-full mt-6"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProjects.map((relatedProject, index) => (
                <div 
                  key={relatedProject.id}
                  className="group animate-fade-in hover:scale-105 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-neutral-200 h-full flex flex-col">
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={relatedProject.image_url}
                        alt={relatedProject.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-neutral-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {relatedProject.title}
                      </h3>
                      <p className="text-neutral-700 mb-4 line-clamp-3 flex-1 leading-relaxed">
                        {relatedProject.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {relatedProject.technologies.slice(0, 3).map((tech) => (
                          <span
                            key={tech}
                            className="px-3 py-1 bg-neutral-200 text-neutral-800 rounded-full text-xs font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                        {relatedProject.technologies.length > 3 && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            +{relatedProject.technologies.length - 3}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/projeto/${relatedProject.slug}`}
                        className="inline-flex items-center justify-center px-4 py-2 bg-white border-2 border-neutral-800 text-neutral-800 hover:bg-neutral-800 hover:text-white rounded-lg font-medium transition-all group/btn"
                      >
                        Ver Projeto
                        <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-16">
              <Link
                href="/#projetos"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
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