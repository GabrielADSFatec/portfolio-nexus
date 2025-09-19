'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  Users, 
  Briefcase, 
  MessageSquare, 
  TrendingUp, 
  Eye,
  Plus,
  Activity
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Metadata } from 'next';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalClients: number;
  unreadMessages: number;
  carouselItems: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalClients: 0,
    unreadMessages: 0,
    carouselItems: 0,
  });
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [
          projectsResult,
          clientsResult,
          messagesResult,
          carouselResult,
        ] = await Promise.all([
          supabase.from('projects').select('id, is_active'),
          supabase.from('clients').select('id, is_active'),
          supabase.from('contact_messages').select('id, is_read'),
          supabase.from('carousel_items').select('id, is_active'),
        ]);

        const projects = projectsResult.data || [];
        const clients = clientsResult.data || [];
        const messages = messagesResult.data || [];
        const carousel = carouselResult.data || [];

        setStats({
          totalProjects: projects.length,
          activeProjects: projects.filter(p => p.is_active).length,
          totalClients: clients.filter(c => c.is_active).length,
          unreadMessages: messages.filter(m => !m.is_read).length,
          carouselItems: carousel.filter(c => c.is_active).length,
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [supabase]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 animate-pulse">
              <div className="w-12 h-12 bg-neutral-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-neutral-200 rounded mb-2"></div>
              <div className="h-6 bg-neutral-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h2 className="text-3xl font-bold text-neutral-900 mb-2">
          Bem-vindo ao Dashboard! 👋
        </h2>
        <p className="text-neutral-600">
          Aqui você pode gerenciar todo o conteúdo do seu portfólio
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Projects */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-600 mb-1">
                <Briefcase className="w-4 h-4" />
                Projetos
              </div>
              <div className="text-2xl font-bold text-neutral-900">{stats.activeProjects}</div>
              <div className="text-sm text-neutral-500">
                {stats.totalProjects} total
              </div>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        {/* Clients */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-600 mb-1">
                <Users className="w-4 h-4" />
                Clientes
              </div>
              <div className="text-2xl font-bold text-neutral-900">{stats.totalClients}</div>
              <div className="text-sm text-neutral-500">ativos</div>
            </div>
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-secondary-600" />
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-600 mb-1">
                <MessageSquare className="w-4 h-4" />
                Mensagens
              </div>
              <div className="text-2xl font-bold text-neutral-900">{stats.unreadMessages}</div>
              <div className="text-sm text-neutral-500">não lidas</div>
            </div>
            <div className="w-12 h-12 bg-accent-blue/10 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-accent-blue" />
            </div>
          </div>
        </div>

        {/* Carousel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-600 mb-1">
                <BarChart3 className="w-4 h-4" />
                Carrossel
              </div>
              <div className="text-2xl font-bold text-neutral-900">{stats.carouselItems}</div>
              <div className="text-sm text-neutral-500">slides ativos</div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className="bg-gradient-primary rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">🎉 Login realizado com sucesso!</h3>
            <p className="text-primary-100">Sistema de autenticação funcionando perfeitamente.</p>
            <p className="text-primary-200 text-sm mt-2">
              Dados carregando do Supabase: {stats.totalProjects} projetos, {stats.totalClients} clientes, {stats.carouselItems} slides
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">✅</div>
              <div className="text-xs text-primary-200">Conectado</div>
            </div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Próximos Passos
          </h3>
          
          <div className="space-y-4 text-sm text-neutral-600">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-neutral-900">✅ Sistema de autenticação</p>
                <p>Login e middleware funcionando</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-neutral-900">✅ Banco de dados</p>
                <p>Tabelas criadas e dados de exemplo</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-neutral-900">⏳ Páginas CRUD</p>
                <p>Criar interfaces para gerenciar conteúdo</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-neutral-900">⏳ Upload de imagens</p>
                <p>Sistema para upload de fotos dos projetos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Site Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Site Público
          </h3>
          
          <p className="text-neutral-600 mb-4">
            Seu portfólio está funcionando com dados reais do Supabase!
          </p>

          <Link
            href="/"
            target="_blank"
            className="btn btn-primary w-full"
          >
            🌐 Ver Site Público
          </Link>

          <div className="mt-4 p-3 bg-neutral-50 rounded-lg text-sm text-neutral-600">
            <p><strong>Homepage:</strong> Carrossel + Projetos + Clientes</p>
            <p><strong>Projeto Individual:</strong> /projeto/[slug]</p>
            <p><strong>Admin:</strong> /admin (onde você está)</p>
          </div>
        </div>
      </div>
    </div>
  );
}