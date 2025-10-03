'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  Users, 
  Briefcase, 
  MessageSquare, 
  Eye,
  Settings,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalClients: number;
  unreadMessages: number;
  carouselItems: number;
  totalMessages: number;
}

interface RecentActivity {
  type: 'project' | 'message' | 'client';
  title: string;
  description: string;
  time: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalClients: 0,
    unreadMessages: 0,
    carouselItems: 0,
    totalMessages: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
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
          supabase.from('projects').select('id, is_active, created_at').order('created_at', { ascending: false }).limit(5),
          supabase.from('clients').select('id, is_active, created_at'),
          supabase.from('contact_messages').select('id, is_read, created_at, name'),
          supabase.from('carousel_items').select('id, is_active, created_at'),
        ]);

        const projects = projectsResult.data || [];
        const clients = clientsResult.data || [];
        const messages = messagesResult.data || [];
        const carousel = carouselResult.data || [];

        // Estatísticas
        setStats({
          totalProjects: projects.length,
          activeProjects: projects.filter(p => p.is_active).length,
          totalClients: clients.filter(c => c.is_active).length,
          unreadMessages: messages.filter(m => !m.is_read).length,
          carouselItems: carousel.filter(c => c.is_active).length,
          totalMessages: messages.length,
        });

        // Atividades recentes
        const activities: RecentActivity[] = [];
        
        // Projetos recentes
        projects.slice(0, 2).forEach(project => {
          activities.push({
            type: 'project',
            title: 'Novo projeto',
            description: `"${project.id.substring(0, 8)}..." adicionado`,
            time: new Date(project.created_at).toLocaleDateString('pt-BR'),
          });
        });

        // Mensagens recentes
        messages.slice(0, 2).forEach(message => {
          activities.push({
            type: 'message',
            title: 'Nova mensagem',
            description: `De: ${message.name}`,
            time: new Date(message.created_at).toLocaleDateString('pt-BR'),
          });
        });

        // Clientes recentes
        clients.slice(0, 1).forEach(client => {
          activities.push({
            type: 'client',
            title: 'Cliente adicionado',
            description: `"${client.id.substring(0, 8)}..." cadastrado`,
            time: new Date(client.created_at).toLocaleDateString('pt-BR'),
          });
        });

        setRecentActivity(activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 4));

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
      <div className="min-h-screen bg-neutral-900 p-6 md:p-8 space-y-8">
        <div className="bg-neutral-800/50 p-6 rounded-xl border border-neutral-700/50 animate-pulse">
          <div className="h-8 bg-neutral-700 rounded w-64 mb-2"></div>
          <div className="h-4 bg-neutral-700 rounded w-96"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-neutral-800/50 p-6 rounded-xl border border-neutral-700/50 animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-neutral-700 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-neutral-700 rounded w-12 mb-1"></div>
                  <div className="h-3 bg-neutral-700 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-neutral-700 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'project': return <Briefcase className="w-4 h-4 text-blue-400" />;
      case 'message': return <MessageSquare className="w-4 h-4 text-green-400" />;
      case 'client': return <Users className="w-4 h-4 text-purple-400" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 space-y-8">
      {/* Welcome Header */}
      <div className="bg-neutral-800/50 p-6 rounded-xl border border-neutral-700/50">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-primary-500" />
          Dashboard Administrativo
        </h2>
        <p className="text-neutral-400">
          Gerencie todo o conteúdo do portfólio da NexusJr em um só lugar!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Projects */}
        <div className="bg-neutral-800/50 p-6 rounded-xl border border-neutral-700/50 hover:border-neutral-600/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-400 mb-1">
                <Briefcase className="w-4 h-4" />
                Projetos
              </div>
              <div className="text-2xl font-bold text-white">{stats.activeProjects}</div>
              <div className="text-sm text-neutral-400">
                {stats.totalProjects} total
              </div>
            </div>
            <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary-400" />
            </div>
          </div>
        </div>

        {/* Clients */}
        <div className="bg-neutral-800/50 p-6 rounded-xl border border-neutral-700/50 hover:border-neutral-600/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-400 mb-1">
                <Users className="w-4 h-4" />
                Clientes
              </div>
              <div className="text-2xl font-bold text-white">{stats.totalClients}</div>
              <div className="text-sm text-neutral-400">ativos</div>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-neutral-800/50 p-6 rounded-xl border border-neutral-700/50 hover:border-neutral-600/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-400 mb-1">
                <MessageSquare className="w-4 h-4" />
                Mensagens
              </div>
              <div className="text-2xl font-bold text-white">{stats.unreadMessages}</div>
              <div className="text-sm text-neutral-400">não lidas</div>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Carousel */}
        <div className="bg-neutral-800/50 p-6 rounded-xl border border-neutral-700/50 hover:border-neutral-600/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-400 mb-1">
                <BarChart3 className="w-4 h-4" />
                Carrossel
              </div>
              <div className="text-2xl font-bold text-white">{stats.carouselItems}</div>
              <div className="text-sm text-neutral-400">slides ativos</div>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Navegação Rápida</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/carousel"
            className="p-4 bg-neutral-700/50 rounded-lg hover:bg-neutral-700 transition-colors text-center"
          >
            <BarChart3 className="w-6 h-6 mx-auto mb-2 text-primary-400" />
            <div className="font-medium text-white">Carrossel</div>
            <div className="text-sm text-neutral-400">{stats.carouselItems} slides</div>
          </Link>
          
          <Link
            href="/admin/projects"
            className="p-4 bg-neutral-700/50 rounded-lg hover:bg-neutral-700 transition-colors text-center"
          >
            <Briefcase className="w-6 h-6 mx-auto mb-2 text-green-400" />
            <div className="font-medium text-white">Projetos</div>
            <div className="text-sm text-neutral-400">{stats.activeProjects} ativos</div>
          </Link>
          
          <Link
            href="/admin/clients"
            className="p-4 bg-neutral-700/50 rounded-lg hover:bg-neutral-700 transition-colors text-center"
          >
            <Users className="w-6 h-6 mx-auto mb-2 text-blue-400" />
            <div className="font-medium text-white">Clientes</div>
            <div className="text-sm text-neutral-400">{stats.totalClients} ativos</div>
          </Link>
          
          <Link
            href="/admin/settings"
            className="p-4 bg-neutral-700/50 rounded-lg hover:bg-neutral-700 transition-colors text-center"
          >
            <Settings className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
            <div className="font-medium text-white">Configurações</div>
            <div className="text-sm text-neutral-400">Empresa</div>
          </Link>
        </div>
      </div>

      {/* Recent Activity & Site Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-neutral-800/50 rounded-xl border border-neutral-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            Atividade Recente
          </h3>
          
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-neutral-800/30 border border-neutral-700/50">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="font-medium text-white text-sm">{activity.title}</p>
                    <p className="text-neutral-400 text-xs">{activity.description}</p>
                  </div>
                  <span className="text-xs text-neutral-500">{activity.time}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-neutral-400">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma atividade recente</p>
              </div>
            )}
          </div>
        </div>

        {/* Site Preview */}
        <div className="bg-gradient-to-br from-primary-900 to-primary-800 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Site Público
          </h3>
          
          <p className="text-primary-200 mb-6">
            Portfólio funcionando com dados do Supabase!
          </p>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center justify-center w-full gap-2 px-6 py-3 text-sm font-medium text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors mb-4"
          >
            🌐 Ver Site Público
          </Link>

          <div className="text-xs text-primary-300 space-y-1">
            <div className="flex justify-between">
              <span>Projetos ativos:</span>
              <span>{stats.activeProjects}</span>
            </div>
            <div className="flex justify-between">
              <span>Clientes:</span>
              <span>{stats.totalClients}</span>
            </div>
            <div className="flex justify-between">
              <span>Slides carrossel:</span>
              <span>{stats.carouselItems}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}