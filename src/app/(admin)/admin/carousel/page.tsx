//listagem

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  ArrowUpDown,
  Search,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CarouselItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Função para extrair o caminho do arquivo da URL do Supabase
const extractFilePathFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    // A URL do Supabase tem o formato: /storage/v1/object/public/portfolio-images/carousel/filename.jpg
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

export default function CarouselPage() {
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'order_index' | 'title' | 'created_at'>('order_index');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const supabase = createClient();

  useEffect(() => {
    loadCarouselItems();
  }, []);

  const loadCarouselItems = async () => {
    try {
      const { data, error } = await supabase
        .from('carousel_items')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Erro ao carregar carrossel:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item do carrossel?\n\nA imagem também será removida do storage.')) {
      return;
    }

    setDeleteLoading(id);
    try {
      // Primeiro busca o item para obter a URL da imagem
      const { data: item, error: fetchError } = await supabase
        .from('carousel_items')
        .select('image_url')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Exclui a imagem do bucket se existir
      if (item?.image_url) {
        const filePath = extractFilePathFromUrl(item.image_url);
        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from('portfolio-images')
            .remove([filePath]);

          if (storageError) {
            console.warn('Aviso: Imagem não encontrada no storage, continuando exclusão...', storageError);
          }
        }
      }

      // Exclui o registro do banco
      const { error } = await supabase
        .from('carousel_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Remove o item da lista localmente
      setItems(prev => prev.filter(item => item.id !== id));
      
      alert('Item excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      alert('Erro ao excluir item. Tente novamente.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('carousel_items')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      // Atualiza o status localmente
      setItems(prev => prev.map(item =>
        item.id === id ? { ...item, is_active: !currentStatus } : item
      ));
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status do item.');
    }
  };

  const handleSort = (column: 'order_index' | 'title' | 'created_at') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Filtra e ordena os itens
  const filteredAndSortedItems = items
    .filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'order_index') {
        return sortOrder === 'asc' ? a.order_index - b.order_index : b.order_index - a.order_index;
      }
      if (sortBy === 'title') {
        return sortOrder === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
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
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Carrossel</h1>
            <p className="text-neutral-400">Gerenciar slides da homepage</p>
          </div>
          <div className="w-40 h-10 bg-neutral-800 rounded-lg animate-pulse"></div>
        </div>
        
        <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700/50">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-16 h-12 bg-neutral-700 rounded-lg"></div>
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
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Carrossel</h1>
          <p className="text-neutral-400">
            {items.length} {items.length === 1 ? 'item' : 'itens'} no carrossel
          </p>
        </div>
        
        <Link
          href="/admin/carousel/edit"
          className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors w-fit"
        >
          <Plus className="w-5 h-5" />
          Adicionar Slide
        </Link>
      </div>

      {/* Search and Stats */}
      <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700/50 mb-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por título ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-4 text-sm text-neutral-400">
            <span className={cn(
              "px-2 py-1 rounded-full",
              items.filter(i => i.is_active).length > 0 
                ? "bg-green-500/20 text-green-400" 
                : "bg-neutral-700/50"
            )}>
              {items.filter(i => i.is_active).length} ativos
            </span>
            <span className="px-2 py-1 rounded-full bg-neutral-700/50">
              {items.length} total
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-neutral-800/50 rounded-xl border border-neutral-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-700/50">
                <th className="text-left p-4">
                  <button
                    onClick={() => handleSort('order_index')}
                    className="flex items-center gap-2 text-neutral-300 font-medium hover:text-white transition-colors"
                  >
                    Ordem
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-left p-4">
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center gap-2 text-neutral-300 font-medium hover:text-white transition-colors"
                  >
                    Slide
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-left p-4 text-neutral-300 font-medium">Status</th>
                <th className="text-left p-4 text-neutral-300 font-medium">Ordem</th>
                <th className="text-left p-4 text-neutral-300 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedItems.map((item) => (
                <tr 
                  key={item.id} 
                  className="border-b border-neutral-700/50 last:border-0 hover:bg-neutral-800/30 transition-colors"
                >
                  <td className="p-4">
                    <div className="w-16 h-12 bg-neutral-700 rounded-lg overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-white mb-1">{item.title}</div>
                      <div className="text-sm text-neutral-400 line-clamp-2">
                        {item.description || 'Sem descrição'}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleActive(item.id, item.is_active)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors',
                        item.is_active
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      )}
                    >
                      {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      {item.is_active ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="p-4 text-neutral-300">
                    {item.order_index}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/carousel/edit/${item.id}`}
                        className="p-2 text-blue-400 hover:bg-blue-400/20 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deleteLoading === item.id}
                        className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Excluir"
                      >
                        {deleteLoading === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-neutral-400 mb-4">
              {searchTerm ? 'Nenhum item encontrado para sua busca.' : 'Nenhum item no carrossel.'}
            </div>
            {!searchTerm && (
              <Link
                href="/admin/carousel/edit"
                className="text-primary-500 hover:text-primary-400 transition-colors"
              >
                Adicionar primeiro item
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}