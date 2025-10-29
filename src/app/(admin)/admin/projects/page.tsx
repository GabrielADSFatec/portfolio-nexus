"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  ArrowUpDown,
  Search,
  Loader2,
  ExternalLink,
  Github,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url: string;
  technologies: string[];
  github_url: string | null;
  live_url: string | null;
  order_index: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  images_count?: number;
}

const extractFilePathFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    const publicIndex = pathParts.indexOf("public");
    if (publicIndex !== -1 && pathParts.length > publicIndex + 2) {
      // Pula "public" e o nome do bucket (portfolio-images)
      return pathParts.slice(publicIndex + 2).join("/");
    }
    return null;
  } catch {
    return null;
  }
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "order_index" | "title" | "created_at" | "is_featured"
  >("order_index");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filter, setFilter] = useState<"all" | "active" | "featured">("all");

  const supabase = createClient();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data: projectsData, error } = await supabase
        .from("projects")
        .select(
          `
          *,
          images:project_images(count)
        `
        )
        .order("order_index", { ascending: true });

      if (error) throw error;

      const projectsWithCount = (projectsData || []).map((project) => ({
        ...project,
        images_count: project.images?.[0]?.count || 0,
      }));

      setProjects(projectsWithCount);
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Tem certeza que deseja excluir este projeto?\n\nTodas as imagens também serão removidas do storage."
      )
    ) {
      return;
    }

    setDeleteLoading(id);
    try {
      // Busca o projeto para obter as URLs das imagens
      const { data: project, error: fetchError } = await supabase
        .from("projects")
        .select("image_url")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Busca as imagens adicionais
      const { data: additionalImages } = await supabase
        .from("project_images")
        .select("image_url")
        .eq("project_id", id);

      // Exclui imagens do storage
      const filesToRemove: string[] = [];

      // Imagem principal
      if (project?.image_url) {
        const filePath = extractFilePathFromUrl(project.image_url);
        if (filePath) filesToRemove.push(filePath);
      }

      // Imagens adicionais
      if (additionalImages) {
        additionalImages.forEach((img) => {
          const filePath = extractFilePathFromUrl(img.image_url);
          if (filePath) filesToRemove.push(filePath);
        });
      }

      // Remove todas as imagens do storage
      if (filesToRemove.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("portfolio-images")
          .remove(filesToRemove);

        if (storageError) {
          console.warn(
            "Aviso: Algumas imagens não foram encontradas no storage:",
            storageError
          );
        }
      }

      // Exclui imagens adicionais do banco
      await supabase.from("project_images").delete().eq("project_id", id);

      // Exclui o projeto do banco
      const { error } = await supabase.from("projects").delete().eq("id", id);

      if (error) throw error;

      setProjects((prev) => prev.filter((project) => project.id !== id));

      alert("Projeto excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir projeto:", error);
      alert("Erro ao excluir projeto. Tente novamente.");
    } finally {
      setDeleteLoading(null);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      setProjects((prev) =>
        prev.map((project) =>
          project.id === id
            ? { ...project, is_active: !currentStatus }
            : project
        )
      );
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      alert("Erro ao alterar status do projeto.");
    }
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({ is_featured: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      setProjects((prev) =>
        prev.map((project) =>
          project.id === id
            ? { ...project, is_featured: !currentStatus }
            : project
        )
      );
    } catch (error) {
      console.error("Erro ao alterar destaque:", error);
      alert("Erro ao alterar status de destaque.");
    }
  };

  const handleSort = (
    column: "order_index" | "title" | "created_at" | "is_featured"
  ) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const filteredAndSortedProjects = projects
    .filter((project) => {
      if (filter === "active" && !project.is_active) return false;
      if (filter === "featured" && !project.is_featured) return false;

      return (
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.technologies.some((tech) =>
          tech.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    })
    .sort((a, b) => {
      if (sortBy === "order_index") {
        return sortOrder === "asc"
          ? a.order_index - b.order_index
          : b.order_index - a.order_index;
      }
      if (sortBy === "title") {
        return sortOrder === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      if (sortBy === "created_at") {
        return sortOrder === "asc"
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "is_featured") {
        return sortOrder === "asc"
          ? a.is_featured === b.is_featured
            ? 0
            : a.is_featured
            ? -1
            : 1
          : a.is_featured === b.is_featured
          ? 0
          : a.is_featured
          ? 1
          : -1;
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Projetos
            </h1>
            <p className="text-neutral-400">Carregando projetos...</p>
          </div>
          <div className="w-40 h-10 bg-neutral-800 rounded-lg animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-neutral-800/50 rounded-xl border border-neutral-700/50 animate-pulse"
            >
              <div className="aspect-video bg-neutral-700 rounded-t-xl"></div>
              <div className="p-6 space-y-3">
                <div className="h-4 bg-neutral-700 rounded"></div>
                <div className="h-3 bg-neutral-700 rounded w-3/4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-neutral-700 rounded w-16"></div>
                  <div className="h-6 bg-neutral-700 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Projetos
          </h1>
          <p className="text-neutral-400">
            {projects.length} {projects.length === 1 ? "projeto" : "projetos"}{" "}
            cadastrados
          </p>
        </div>

        <Link
          href="/admin/projects/edit"
          className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors w-fit"
        >
          <Plus className="w-5 h-5" />
          Adicionar Projeto
        </Link>
      </div>

      {/* Search and Stats */}
      <div className="bg-neutral-800/50 rounded-xl p-4 sm:p-6 border border-neutral-700/50 mb-6">
        <div className="flex flex-col gap-4">
          {/* Search Input - Ocupa toda a largura no mobile */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por título, descrição ou tecnologias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filters and Stats - Reorganizado para mobile */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            {/* Filter Buttons */}
            <div className="flex gap-2 justify-center sm:justify-start">
              {(["all", "active", "featured"] as const).map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={cn(
                    "px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                    filter === filterType
                      ? "bg-primary-500 text-white"
                      : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                  )}
                >
                  {filterType === "all" && "Todos"}
                  {filterType === "active" && "Ativos"}
                  {filterType === "featured" && "Destaques"}
                </button>
              ))}
            </div>

            {/* Stats - Agora fica abaixo dos botões no mobile */}
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <span
                className={cn(
                  "px-2 py-1 rounded-full text-xs sm:text-sm",
                  projects.filter((p) => p.is_active).length > 0
                    ? "bg-green-500/20 text-green-400"
                    : "bg-neutral-700/50 text-neutral-400"
                )}
              >
                {projects.filter((p) => p.is_active).length} ativos
              </span>
              <span
                className={cn(
                  "px-2 py-1 rounded-full text-xs sm:text-sm",
                  projects.filter((p) => p.is_featured).length > 0
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-neutral-700/50 text-neutral-400"
                )}
              >
                {projects.filter((p) => p.is_featured).length} destaques
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedProjects.map((project) => (
          <div
            key={project.id}
            className={cn(
              "bg-neutral-800/50 rounded-xl border overflow-hidden transition-all hover:shadow-lg",
              project.is_active
                ? "border-neutral-700/50 hover:border-neutral-600/50"
                : "border-red-500/20 opacity-60"
            )}
          >
            {/* Project Image */}
            <div className="relative aspect-video bg-neutral-700 overflow-hidden">
              <Image
                src={project.image_url}
                alt={project.title}
                fill
                className="object-cover"
              />

              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                {project.is_featured && (
                  <span className="px-2 py-1 bg-yellow-500 text-yellow-900 rounded-full text-xs font-bold flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Destaque
                  </span>
                )}
                {!project.is_active && (
                  <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-bold">
                    Inativo
                  </span>
                )}
              </div>

              {/* Image Count */}
              <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 text-white rounded-full text-xs">
                {(project.images_count || 0) + 1} imagens
              </div>
            </div>

            {/* Project Content */}
            <div className="p-6">
              <h3 className="font-semibold text-white mb-2 line-clamp-1">
                {project.title}
              </h3>

              <p className="text-neutral-300 text-sm line-clamp-2 mb-4">
                {project.description}
              </p>

              {/* Technologies */}
              <div className="flex flex-wrap gap-1 mb-4">
                {project.technologies.slice(0, 3).map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-1 bg-primary-500/20 text-primary-300 rounded text-xs"
                  >
                    {tech}
                  </span>
                ))}
                {project.technologies.length > 3 && (
                  <span className="px-2 py-1 bg-neutral-700 text-neutral-300 rounded text-xs">
                    +{project.technologies.length - 3}
                  </span>
                )}
              </div>

              {/* Links */}
              <div className="flex items-center gap-3 mb-4">
                {project.live_url && (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Live
                  </a>
                )}
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-neutral-400 hover:text-neutral-300 text-sm"
                  >
                    <Github className="w-3 h-3" />
                    GitHub
                  </a>
                )}
              </div>

              {/* Project Info */}
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Ordem: {project.order_index}</span>
                <span>
                  {new Date(project.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-neutral-800/30 border-t border-neutral-700/50 flex justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    toggleFeatured(project.id, project.is_featured)
                  }
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    project.is_featured
                      ? "text-yellow-400 hover:bg-yellow-500/20"
                      : "text-neutral-400 hover:bg-neutral-700"
                  )}
                  title={
                    project.is_featured
                      ? "Remover destaque"
                      : "Destacar projeto"
                  }
                >
                  {project.is_featured ? (
                    <Star className="w-4 h-4" />
                  ) : (
                    <StarOff className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={() => toggleActive(project.id, project.is_active)}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    project.is_active
                      ? "text-green-400 hover:bg-green-500/20"
                      : "text-red-400 hover:bg-red-500/20"
                  )}
                  title={
                    project.is_active ? "Desativar projeto" : "Ativar projeto"
                  }
                >
                  {project.is_active ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/admin/projects/edit/${project.id}`}
                  className="p-2 text-blue-400 hover:bg-blue-400/20 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => handleDelete(project.id)}
                  disabled={deleteLoading === project.id}
                  className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors disabled:opacity-50"
                  title="Excluir"
                >
                  {deleteLoading === project.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-neutral-400" />
          </div>
          <div className="text-neutral-400 mb-4">
            {searchTerm || filter !== "all"
              ? "Nenhum projeto encontrado para sua busca."
              : "Nenhum projeto cadastrado."}
          </div>
          {!searchTerm && filter === "all" && (
            <Link
              href="/admin/projects/edit"
              className="text-primary-500 hover:text-primary-400 transition-colors"
            >
              Adicionar primeiro projeto
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
