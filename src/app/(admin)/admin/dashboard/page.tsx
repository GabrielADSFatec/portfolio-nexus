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
import { cn } from '@/lib/utils';  // Add this import
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

  const nextSteps = [
    { status: 'done', title: 'Sistema de autenticação', desc: 'Login e middleware funcionando' },
    { status: 'done', title: 'Banco de dados', desc: 'Tabelas criadas e dados de exemplo' },
    { status: 'pending', title: 'Páginas CRUD', desc: 'Criar interfaces para gerenciar conteúdo' },
    { status: 'pending', title: 'Upload de imagens', desc: 'Sistema para upload de fotos dos projetos' },
  ];

  const siteRoutes = [
    { label: 'Homepage', value: 'Carrossel + Projetos + Clientes' },
    { label: 'Projeto Individual', value: '/projeto/[slug]' },
    { label: 'Admin', value: '/admin (onde você está)' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-neutral-800/50 p-6 rounded-xl shadow-sm border border-neutral-700/50 animate-pulse">
              <div className="w-12 h-12 bg-neutral-700 rounded-lg mb-4"></div>
              <div className="h-4 bg-neutral-700 rounded mb-2"></div>
              <div className="h-6 bg-neutral-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 p-6 md:p-8 space-y-8">
      {/* Welcome Header */}
      <div className="bg-neutral-800/50 p-6 rounded-xl shadow-sm border border-neutral-700/50">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Activity className="w-8 h-8 text-primary-500" />
          Dashboard Administrativo
        </h2>
        <p className="text-neutral-400">
          Gerencie todo o conteúdo do seu portfólio em um só lugar
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
        <div className="bg-neutral-800/50 rounded-xl shadow-sm border border-neutral-700/50 p-6 hover:shadow-md transition-all">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary-500" />
            Próximos Passos
          </h3>
          
          <div className="space-y-6">
            {nextSteps.map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
                <div className={cn(
                  "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                  item.status === 'done' ? 'bg-green-500' : 'bg-yellow-500'
                )}></div>
                <div>
                  <p className="font-medium text-white">
                    {item.status === 'done' ? '✅ ' : '⏳ '}{item.title}
                  </p>
                  <p className="text-neutral-400 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Site Preview */}
        <div className="bg-gradient-to-br from-primary-900 to-primary-800 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Site Público
          </h3>
          
          <p className="text-primary-200 mb-6">
            Seu portfólio está funcionando com dados reais do Supabase!
          </p>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center justify-center w-full gap-2 px-6 py-3 text-sm font-medium text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            🌐 Ver Site Público
          </Link>

          <div className="mt-6 space-y-3">
            {siteRoutes.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-primary-200">{item.label}:</span>
                <span className="text-primary-300">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}