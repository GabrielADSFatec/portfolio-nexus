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
    .select('*') // ← Selecionar todos os campos, não apenas alguns
    .neq('id', currentProjectId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  return data || [];
}

// Generate metadata
export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params; // ← Await params primeiro
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

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params; // ← Await params primeiro
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

  const relatedProjects = await getRelatedProjects(project.id);

  return (
    <main className="min-h-screen pt-20 bg-neutral-50">
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-white via-primary-50/30 to-secondary-50/20">
        <div className="container">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-8">
            <Link 
              href="/"
              className="hover:text-primary-600 transition-colors font-medium"
            >
              Início
            </Link>
            <span className="text-neutral-400">/</span>
            <Link 
              href="/#projetos"
              className="hover:text-primary-600 transition-colors font-medium"
            >
              Projetos
            </Link>
            <span className="text-neutral-400">/</span>
            <span className="text-neutral-800 font-semibold">{project.title}</span>
          </div>

          {/* Back button */}
          <Link
            href="/#projetos"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold mb-8 group bg-white px-4 py-2 rounded-lg shadow-sm border border-primary-100 hover:shadow-md transition-all"
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
                  <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
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
                <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <div className="text-sm text-neutral-500 font-medium">Criado em</div>
                      <div className="text-lg font-semibold text-neutral-900">{formatDate(project.created_at)}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                      <Code className="w-6 h-6 text-secondary-600" />
                    </div>
                    <div>
                      <div className="text-sm text-neutral-500 font-medium">Tecnologias</div>
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
                    className="btn btn-primary btn-lg inline-flex items-center gap-3 group shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 transition-all"
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
                    className="btn btn-outline btn-lg inline-flex items-center gap-3 group bg-white hover:bg-neutral-900 hover:text-white border-neutral-300 hover:border-neutral-900 transition-all"
                  >
                    <Github className="w-5 h-5" />
                    Ver Código
                  </a>
                )}
              </div>

              {/* Technologies */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
                <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2 text-lg">
                  <Tag className="w-5 h-5 text-primary-600" />
                  Tecnologias Utilizadas
                </h3>
                <div className="flex flex-wrap gap-3">
                  {project.technologies.map((tech, index) => (
                    <span
                      key={tech}
                      className={cn(
                        "px-4 py-2 rounded-lg font-semibold text-sm shadow-sm border transition-all hover:scale-105",
                        index % 4 === 0 && "bg-primary-50 text-primary-800 border-primary-200 hover:bg-primary-100",
                        index % 4 === 1 && "bg-secondary-50 text-secondary-800 border-secondary-200 hover:bg-secondary-100",
                        index % 4 === 2 && "bg-green-50 text-green-800 border-green-200 hover:bg-green-100",
                        index % 4 === 3 && "bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100"
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
              <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 shadow-lg text-white">
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
              <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full"></div>
            </div>
            
            {project.full_description ? (
              <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-8 md:p-12">
                <div 
                  className="prose prose-lg prose-neutral max-w-none prose-headings:text-neutral-900 prose-headings:font-bold prose-p:text-neutral-700 prose-p:leading-relaxed prose-a:text-primary-600 prose-strong:text-neutral-900 prose-ul:text-neutral-700 prose-li:text-neutral-700"
                  dangerouslySetInnerHTML={{ __html: project.full_description }}
                />
              </div>
            ) : (
              <div className="text-center py-16 bg-neutral-50 rounded-2xl border border-neutral-200">
                <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Code className="w-10 h-10 text-neutral-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Descrição Detalhada
                </h3>
                <p className="text-neutral-600">
                  A descrição completa deste projeto será adicionada em breve...
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-neutral-50 to-primary-50/20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Outros Projetos
              </h2>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                Confira outros trabalhos que desenvolvi
              </p>
              <div className="w-24 h-1 bg-gradient-secondary mx-auto rounded-full mt-6"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProjects.map((relatedProject, index) => (
                <div 
                  key={relatedProject.id}
                  className="group animate-fade-in hover:scale-105 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-neutral-100 h-full flex flex-col">
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
                      <h3 className="text-xl font-bold text-neutral-900 mb-3 group-hover:text-primary-600 transition-colors">
                        {relatedProject.title}
                      </h3>
                      <p className="text-neutral-600 mb-4 line-clamp-3 flex-1 leading-relaxed">
                        {relatedProject.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {relatedProject.technologies.slice(0, 3).map((tech) => (
                          <span
                            key={tech}
                            className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                        {relatedProject.technologies.length > 3 && (
                          <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                            +{relatedProject.technologies.length - 3}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/projeto/${relatedProject.slug}`}
                        className="btn btn-outline w-full group/btn border-neutral-200 text-neutral-700 hover:bg-primary-600 hover:border-primary-600 hover:text-white transition-all"
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
                className="btn btn-primary btn-lg shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 transition-all"
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