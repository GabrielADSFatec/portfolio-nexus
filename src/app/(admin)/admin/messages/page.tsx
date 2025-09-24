'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Mail, 
  Search, 
  Eye, 
  EyeOff, 
  Trash2, 
  Calendar,
  User,
  MailOpen,
  Filter,
  ChevronDown,
  ChevronUp,
  Loader2,
  Reply,
  Phone,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type SortField = 'created_at' | 'name' | 'email';
type SortOrder = 'asc' | 'desc';
type FilterStatus = 'all' | 'unread' | 'read';

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleReadStatus = async (messageId: string, currentStatus: boolean) => {
    setActionLoading(messageId);
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: !currentStatus })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, is_read: !currentStatus } : msg
      ));

      if (selectedMessage?.id === messageId) {
        setSelectedMessage(prev => prev ? { ...prev, is_read: !currentStatus } : null);
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta mensagem?\n\nEsta ação não pode ser desfeita.')) {
      return;
    }

    setActionLoading(messageId);
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_active: false })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Erro ao excluir mensagem:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSortedAndFilteredMessages = () => {
    let filtered = messages.filter(msg => 
      msg.is_active && (
        msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    if (filterStatus === 'read') {
      filtered = filtered.filter(msg => msg.is_read);
    } else if (filterStatus === 'unread') {
      filtered = filtered.filter(msg => !msg.is_read);
    }

    return filtered.sort((a, b) => {
      if (sortField === 'created_at') {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      if (sortField === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      
      if (sortField === 'email') {
        return sortOrder === 'asc'
          ? a.email.localeCompare(b.email)
          : b.email.localeCompare(a.email);
      }
      
      return 0;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora mesmo';
    if (diffInHours < 24) return `Há ${diffInHours}h`;
    if (diffInHours < 168) return `Há ${Math.floor(diffInHours / 24)}d`;
    return formatDate(dateString);
  };

  const sortedMessages = getSortedAndFilteredMessages();
  const unreadCount = messages.filter(msg => !msg.is_read && msg.is_active).length;
  const totalCount = messages.filter(msg => msg.is_active).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Mensagens</h1>
            <p className="text-neutral-400">Carregando mensagens...</p>
          </div>
        </div>

        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-neutral-800/50 p-6 rounded-xl border border-neutral-700/50 animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 bg-neutral-700 rounded w-32"></div>
                <div className="h-3 bg-neutral-700 rounded w-20"></div>
              </div>
              <div className="h-4 bg-neutral-700 rounded w-48 mb-2"></div>
              <div className="h-3 bg-neutral-700 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Mensagens</h1>
              <p className="text-neutral-400">
                {totalCount} {totalCount === 1 ? 'mensagem' : 'mensagens'} • {unreadCount} não lidas
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar mensagens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="appearance-none pl-10 pr-8 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              >
                <option value="all">Todas as mensagens</option>
                <option value="unread">Não lidas</option>
                <option value="read">Lidas</option>
              </select>
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-neutral-800/50 p-4 rounded-lg border border-neutral-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{totalCount}</div>
                <div className="text-sm text-neutral-400">Total</div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-800/50 p-4 rounded-lg border border-neutral-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <MailOpen className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{totalCount - unreadCount}</div>
                <div className="text-sm text-neutral-400">Lidas</div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-800/50 p-4 rounded-lg border border-neutral-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <EyeOff className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{unreadCount}</div>
                <div className="text-sm text-neutral-400">Não lidas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="bg-neutral-800/50 rounded-xl border border-neutral-700/50 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-neutral-700/50 text-sm font-medium text-neutral-400">
            <div className="col-span-1"></div>
            <button 
              onClick={() => handleSort('name')}
              className="col-span-3 text-left flex items-center gap-1 hover:text-white transition-colors"
            >
              Remetente
              {sortField === 'name' && (
                sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
              )}
            </button>
            <button 
              onClick={() => handleSort('email')}
              className="col-span-3 text-left flex items-center gap-1 hover:text-white transition-colors"
            >
              E-mail
              {sortField === 'email' && (
                sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
              )}
            </button>
            <div className="col-span-4">Mensagem</div>
            <button 
              onClick={() => handleSort('created_at')}
              className="col-span-1 text-left flex items-center gap-1 hover:text-white transition-colors"
            >
              Data
              {sortField === 'created_at' && (
                sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Messages */}
          <div className="divide-y divide-neutral-700/50">
            {sortedMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "grid grid-cols-12 gap-4 p-4 transition-colors cursor-pointer",
                  message.is_read 
                    ? "bg-neutral-800/30 hover:bg-neutral-800/50" 
                    : "bg-blue-500/5 hover:bg-blue-500/10",
                  selectedMessage?.id === message.id && "bg-primary-500/10"
                )}
                onClick={() => setSelectedMessage(message)}
              >
                <div className="col-span-1 flex items-center justify-center">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    message.is_read ? "bg-green-500" : "bg-yellow-500 animate-pulse"
                  )} />
                </div>

                <div className="col-span-3">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-neutral-400" />
                    <span className="font-medium text-white">{message.name}</span>
                  </div>
                </div>

                <div className="col-span-3">
                  <div className="text-sm text-neutral-300 truncate" title={message.email}>
                    {message.email}
                  </div>
                </div>

                <div className="col-span-4">
                  <div className="text-sm text-neutral-300 line-clamp-2">
                    {message.message}
                  </div>
                </div>

                <div className="col-span-1">
                  <div className="text-xs text-neutral-400 text-right">
                    {getTimeAgo(message.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {sortedMessages.length === 0 && (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
              <div className="text-neutral-400 mb-2">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Nenhuma mensagem encontrada' 
                  : 'Nenhuma mensagem recebida'
                }
              </div>
              <div className="text-neutral-500 text-sm">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Tente ajustar os filtros de busca' 
                  : 'As mensagens aparecerão aqui quando forem recebidas'
                }
              </div>
            </div>
          )}
        </div>

        {/* Message Detail Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-neutral-800 rounded-xl border border-neutral-700 max-w-2xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-neutral-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    Mensagem de {selectedMessage.name}
                  </h3>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-neutral-400" />
                    <span className="text-neutral-300">{selectedMessage.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-neutral-400" />
                    <span className="text-neutral-300">{selectedMessage.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-neutral-400" />
                    <span className="text-neutral-300">{formatDate(selectedMessage.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      selectedMessage.is_read ? "bg-green-500" : "bg-yellow-500"
                    )} />
                    <span className="text-neutral-300">
                      {selectedMessage.is_read ? 'Lida' : 'Não lida'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="p-6 overflow-y-auto max-h-96">
                <div className="prose prose-invert max-w-none">
                  <p className="text-neutral-200 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-neutral-700 flex justify-between">
                <div className="flex gap-2">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: Mensagem do portfólio`}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Reply className="w-4 h-4" />
                    Responder
                  </a>
                  
                  <button
                    onClick={() => toggleReadStatus(selectedMessage.id, selectedMessage.is_read)}
                    disabled={actionLoading === selectedMessage.id}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                      selectedMessage.is_read
                        ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                        : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    )}
                  >
                    {actionLoading === selectedMessage.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : selectedMessage.is_read ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                    {selectedMessage.is_read ? 'Marcar como não lida' : 'Marcar como lida'}
                  </button>
                </div>

                <button
                  onClick={() => deleteMessage(selectedMessage.id)}
                  disabled={actionLoading === selectedMessage.id}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  {actionLoading === selectedMessage.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}