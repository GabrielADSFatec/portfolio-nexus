'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  ArrowUpDown,
  Search,
  Loader2,
  Building,
  Globe,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Client {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  description: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const extractFilePathFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const publicIndex = pathParts.indexOf('public');
    if (publicIndex !== -1) {
      return pathParts.slice(publicIndex + 1).join('/');
    }
    return null;
  } catch {
    return null;
  }
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'order_index' | 'name' | 'created_at'>('order_index');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const supabase = createClient();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?\n\nO logo também será removido do storage.')) {
      return;
    }

    setDeleteLoading(id);
    try {
      // Busca o cliente para obter a URL do logo
      const { data: client, error: fetchError } = await supabase
        .from('clients')
        .select('logo_url')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Exclui o logo do bucket se existir
      if (client?.logo_url) {
        const filePath = extractFilePathFromUrl(client.logo_url);
        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from('portfolio-images')
            .remove([filePath]);

          if (storageError) {
            console.warn('Aviso: Logo não encontrado no storage, continuando exclusão...', storageError);
          }
        }
      }

      // Exclui o registro do banco
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setClients(prev => prev.filter(client => client.id !== id));
      
      alert('Cliente excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      alert('Erro ao excluir cliente. Tente novamente.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      setClients(prev => prev.map(client =>
        client.id === id ? { ...client, is_active: !currentStatus } : client
      ));
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status do cliente.');
    }
  };

  const handleSort = (column: 'order_index' | 'name' | 'created_at') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedClients = clients
    .filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.website_url?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'order_index') {
        return sortOrder === 'asc' ? a.order_index - b.order_index : b.order_index - a.order_index;
      }
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (sortBy === 'created_at') {
        return sortOrder === 'asc'
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Clientes</h1>
            <p className="text-neutral-400">Gerenciar clientes/empresas</p>
          </div>
          <div className="w-40 h-10 bg-neutral-800 rounded-lg animate-pulse"></div>
        </div>
        
        <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700/50">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-16 h-16 bg-neutral-700 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-700 rounded"></div>
                  <div className="h-3 bg-neutral-700 rounded w-3/4"></div>
                </div>
                <div className="w-20 h-8 bg-neutral-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Clientes</h1>
          <p className="text-neutral-400">
            {clients.length} {clients.length === 1 ? 'cliente' : 'clientes'} cadastrados
          </p>
        </div>
        
        <Link
          href="/admin/clients/edit"
          className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors w-fit"
        >
          <Plus className="w-5 h-5" />
          Adicionar Cliente
        </Link>
      </div>

      {/* Search and Stats */}
      <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700/50 mb-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nome, descrição ou website..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-4 text-sm text-neutral-400">
            <span className={cn(
              "px-2 py-1 rounded-full",
              clients.filter(c => c.is_active).length > 0 
                ? "bg-green-500/20 text-green-400" 
                : "bg-neutral-700/50"
            )}>
              {clients.filter(c => c.is_active).length} ativos
            </span>
            <span className="px-2 py-1 rounded-full bg-neutral-700/50">
              {clients.length} total
            </span>
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedClients.map((client) => (
          <div 
            key={client.id} 
            className={cn(
              "bg-neutral-800/50 rounded-xl border overflow-hidden transition-all hover:shadow-lg",
              client.is_active 
                ? "border-neutral-700/50 hover:border-neutral-600/50" 
                : "border-red-500/20 opacity-60"
            )}
          >
            {/* Client Header */}
            <div className="p-6 border-b border-neutral-700/50">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 bg-neutral-700 rounded-lg overflow-hidden flex items-center justify-center">
                  {client.logo_url ? (
                    <Image
                      src={client.logo_url}
                      alt={client.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Building className="w-8 h-8 text-neutral-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{client.name}</h3>
                  {client.website_url && (
                    <a 
                      href={client.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors truncate"
                    >
                      <Globe className="w-3 h-3" />
                      {client.website_url.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
                <button
                  onClick={() => toggleActive(client.id, client.is_active)}
                  className={cn(
                    'p-2 rounded-full transition-colors',
                    client.is_active
                      ? 'text-green-400 hover:bg-green-500/20'
                      : 'text-red-400 hover:bg-red-500/20'
                  )}
                  title={client.is_active ? 'Desativar cliente' : 'Ativar cliente'}
                >
                  {client.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Client Content */}
            <div className="p-6">
              {client.description && (
                <p className="text-neutral-300 text-sm line-clamp-3 mb-4">
                  {client.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-sm text-neutral-400">
                <div className="flex items-center gap-2">
                  <Star className="w-3 h-3" />
                  Ordem: {client.order_index}
                </div>
                <div className={cn(
                  "px-2 py-1 rounded-full text-xs",
                  client.is_active 
                    ? "bg-green-500/20 text-green-400" 
                    : "bg-red-500/20 text-red-400"
                )}>
                  {client.is_active ? 'Ativo' : 'Inativo'}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-neutral-800/30 border-t border-neutral-700/50 flex justify-end gap-2">
              <Link
                href={`/admin/clients/edit/${client.id}`}
                className="p-2 text-blue-400 hover:bg-blue-400/20 rounded-lg transition-colors"
                title="Editar"
              >
                <Edit className="w-4 h-4" />
              </Link>
              <button
                onClick={() => handleDelete(client.id)}
                disabled={deleteLoading === client.id}
                className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors disabled:opacity-50"
                title="Excluir"
              >
                {deleteLoading === client.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedClients.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
          <div className="text-neutral-400 mb-4">
            {searchTerm ? 'Nenhum cliente encontrado para sua busca.' : 'Nenhum cliente cadastrado.'}
          </div>
          {!searchTerm && (
            <Link
              href="/admin/clients/edit"
              className="text-primary-500 hover:text-primary-400 transition-colors"
            >
              Adicionar primeiro cliente
            </Link>
          )}
        </div>
      )}
    </div>
  );
}