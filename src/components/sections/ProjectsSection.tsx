"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Github, Eye } from "lucide-react";
import { Project } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "featured">("all");
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(8);

  const supabase = createClient();

  // Carregar dados do Supabase
  useEffect(() => {
    const loadProjectsData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let query = supabase
          .from("projects")
          .select("*")
          .eq("is_active", true)
          .order("order_index", { ascending: true });

        // Se o filtro for 'featured', adicionar condição
        if (filter === "featured") {
          query = query.eq("is_featured", true);
        }

        const { data, error: supabaseError } = await query;

        if (supabaseError) {
          console.error("Erro ao carregar projetos:", supabaseError);
          setError("Erro ao carregar projetos");
          return;
        }

        if (data) {
          setProjects(data);
        }
      } catch (err) {
        console.error("Erro inesperado:", err);
        setError("Erro inesperado ao carregar projetos");
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectsData();
  }, [supabase, filter]);

  const filteredProjects =
    filter === "featured"
      ? projects.filter((project) => project.is_featured)
      : projects;

  const displayedProjects = filteredProjects.slice(0, visibleCount);
  const hasMore = filteredProjects.length > visibleCount;

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
            Nossos <span className="gradient-text">Projetos</span>
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8">
            Uma seleção dos projetos desenvolvidos, demonstrando diferentes
            áreas de atuação.
          </p>

          {/* Filtros - CORES CORRIGIDAS */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-6 py-3 rounded-lg font-medium transition-all duration-200",
                filter === "all"
                  ? "bg-neutral-800 text-white shadow-md hover:bg-neutral-700"
                  : "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
              )}
            >
              Todos os Projetos
            </button>
            <button
              onClick={() => setFilter("featured")}
              className={cn(
                "px-6 py-3 rounded-lg font-medium transition-all duration-200",
                filter === "featured"
                  ? "bg-neutral-800 text-white shadow-md hover:bg-neutral-700"
                  : "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
              )}
            >
              Projetos em Destaque
            </button>
          </div>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="text-center py-8 bg-red-50 rounded-lg mb-8">
            <p className="text-red-600">{error}</p>
            <p className="text-sm text-red-500 mt-2">
              Verifique sua conexão com a internet e tente novamente.
            </p>
          </div>
        )}

        {/* Grid de projetos */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-neutral-500">
              {filter === "featured"
                ? "Nenhum projeto em destaque encontrado."
                : "Nenhum projeto encontrado."}
            </p>
            <p className="text-neutral-400 mt-2">
              {filter === "featured"
                ? "Tente visualizar todos os projetos."
                : "Verifique se há projetos ativos no banco de dados."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayedProjects.map((project) => (
              <div key={project.id} className="group w-full lg:max-w-sm">
                <div className="card-hover p-0 overflow-hidden h-full flex flex-col bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
                  {/* Imagem do projeto */}
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={
                        project.image_url || "/images/placeholder-project.png"
                      }
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        console.warn(
                          "Erro ao carregar imagem do projeto:",
                          project.image_url
                        );
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/placeholder-project.png";
                      }}
                    />
                    {project.is_featured && (
                      <div className="absolute top-4 left-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                        Destaque
                      </div>
                    )}

                    {/* Overlay com links */}
                    <div className="absolute inset-0 bg-neutral-900/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4">
                      <Link
                        href={`/projeto/${project.slug}`}
                        className="p-3 bg-white rounded-full text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors shadow-lg"
                        title="Ver detalhes do projeto"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>

                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-white rounded-full text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors shadow-lg"
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
                          className="p-3 bg-white rounded-full text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors shadow-lg"
                          title="Ver projeto online"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Conteúdo do card */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-semibold text-neutral-900 mb-3 group-hover:text-neutral-700 transition-colors">
                      {project.title}
                    </h3>

                    <p className="text-neutral-600 mb-4 line-clamp-3 flex-1">
                      {project.description}
                    </p>

                    {/* Tecnologias - CORES CORRIGIDAS */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.technologies?.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies &&
                        project.technologies.length > 3 && (
                          <span className="px-3 py-1 bg-neutral-200 text-neutral-700 rounded-full text-sm font-medium border border-neutral-300">
                            +{project.technologies.length - 3}
                          </span>
                        )}
                    </div>

                    {/* Botão Ver Mais - CORES CORRIGIDAS */}
                    <Link
                      href={`/projeto/${project.slug}`}
                      className="inline-flex items-center justify-center px-4 py-3 bg-white border-2 border-neutral-800 text-neutral-800 rounded-lg font-medium hover:bg-neutral-800 hover:text-white transition-all duration-200 group/btn mt-auto"
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

        {/* Botão Carregar Mais */}
        {hasMore && (
          <div className="text-center mt-12">
            <button
              onClick={() => setVisibleCount((prev) => prev + 4)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-800 text-white rounded-lg font-medium hover:bg-neutral-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <span className="text-2xl">+</span>
              Carregar Mais Projetos
            </button>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <p className="text-lg text-neutral-600 mb-6">
            Gostou do que viu? Vamos conversar sobre seu próximo projeto!
          </p>
          <Link
            href="#contato"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#023373] to-[#0468BF] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            Entrar em Contato
          </Link>
        </div>
      </div>
    </section>
  );
}
