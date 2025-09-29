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
  MessageSquare,
  ChevronLeft,
  ChevronRight
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
  const [isScrolled, setIsScrolled] = useState(false);

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

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollLeft > 0);
  };

  const scrollTable = (direction: 'left' | 'right') => {
    const tableContainer = document.getElementById('messages-table');
    if (tableContainer) {
      const scrollAmount = 200;
      tableContainer.scrollLeft += direction === 'right' ? scrollAmount : -scrollAmount;
    }
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
    <div className="min-h-screen bg-neutral-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-white">Mensagens</h1>
              <p className="text-neutral-400 text-sm md:text-base">
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
                className="pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 text-sm md:text-base"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="appearance-none pl-10 pr-8 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm md:text-base"
              >
                <option value="all">Todas</option>
                <option value="unread">Não lidas</option>
                <option value="read">Lidas</option>
              </select>
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-neutral-800/50 p-3 md:p-4 rounded-lg border border-neutral-700/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-white">{totalCount}</div>
                <div className="text-xs md:text-sm text-neutral-400">Total</div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-800/50 p-3 md:p-4 rounded-lg border border-neutral-700/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <MailOpen className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-white">{totalCount - unreadCount}</div>
                <div className="text-xs md:text-sm text-neutral-400">Lidas</div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-800/50 p-3 md:p-4 rounded-lg border border-neutral-700/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <EyeOff className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-white">{unreadCount}</div>
                <div className="text-xs md:text-sm text-neutral-400">Não lidas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages List com Scroll Horizontal */}
        <div className="bg-neutral-800/50 rounded-xl border border-neutral-700/50 overflow-hidden">
          {/* Container do Scroll */}
          <div className="relative">
            {/* Botões de Scroll para Mobile - MODIFICADO */}
            <div className="md:hidden absolute left-2 -translate-y-full z-10 flex gap-1">
              <button
                onClick={() => scrollTable('left')}
                className="p-2 bg-neutral-800/90 hover:bg-neutral-700/90 rounded-lg text-white shadow-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollTable('right')}
                className="p-2 bg-neutral-800/90 hover:bg-neutral-700/90 rounded-lg text-white shadow-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Table Container */}
            <div
              id="messages-table"
              className="overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-800"
              onScroll={handleScroll}
            >
              <div className="min-w-[800px]">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-3 p-3 md:p-4 border-b border-neutral-700/50 text-sm font-medium text-neutral-400">
                  <div className="col-span-1 flex justify-center min-w-[40px]">
                    <span className="hidden md:inline">Status</span>
                    <span className="md:hidden">•</span>
                  </div>

                  <button
                    onClick={() => handleSort('name')}
                    className="col-span-3 text-left flex items-center gap-1 hover:text-white transition-colors min-w-[120px]"
                  >
                    <span className="truncate">Remetente</span>
                    {sortField === 'name' && (
                      sortOrder === 'asc' ?
                        <ChevronUp className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" /> :
                        <ChevronDown className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                    )}
                  </button>

                  <button
                    onClick={() => handleSort('email')}
                    className="col-span-3 text-left flex items-center gap-1 hover:text-white transition-colors min-w-[150px]"
                  >
                    <span className="truncate">E-mail</span>
                    {sortField === 'email' && (
                      sortOrder === 'asc' ?
                        <ChevronUp className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" /> :
                        <ChevronDown className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                    )}
                  </button>

                  <div className="col-span-3 min-w-[180px] truncate">Mensagem</div>

                  <button
                    onClick={() => handleSort('created_at')}
                    className="col-span-2 text-left flex items-center gap-1 hover:text-white transition-colors min-w-[100px]"
                  >
                    <span className="truncate">Data</span>
                    {sortField === 'created_at' && (
                      sortOrder === 'asc' ?
                        <ChevronUp className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" /> :
                        <ChevronDown className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                    )}
                  </button>
                </div>

                {/* Messages */}
                <div className="divide-y divide-neutral-700/50">
                  {sortedMessages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "grid grid-cols-12 gap-3 p-3 md:p-4 transition-colors cursor-pointer hover:bg-neutral-700/30",
                        message.is_read
                          ? "bg-neutral-800/30"
                          : "bg-blue-500/5",
                        selectedMessage?.id === message.id && "bg-blue-500/10 border-l-4 border-l-blue-500"
                      )}
                      onClick={() => setSelectedMessage(message)}
                    >
                      {/* Status */}
                      <div className="col-span-1 flex items-center justify-center min-w-[40px]">
                        <div className={cn(
                          "w-2 h-2 md:w-3 md:h-3 rounded-full",
                          message.is_read ? "bg-green-500" : "bg-yellow-500 animate-pulse"
                        )} />
                      </div>

                      {/* Remetente */}
                      <div className="col-span-3 min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 md:w-4 md:h-4 text-neutral-400 flex-shrink-0" />
                          <span className="font-medium text-white text-sm truncate" title={message.name}>
                            {message.name}
                          </span>
                        </div>
                      </div>

                      {/* E-mail */}
                      <div className="col-span-3 min-w-[150px]">
                        <div className="text-xs md:text-sm text-neutral-300 truncate" title={message.email}>
                          {message.email}
                        </div>
                      </div>

                      {/* Mensagem */}
                      <div className="col-span-3 min-w-[180px]">
                        <div className="text-xs md:text-sm text-neutral-300 line-clamp-2 md:line-clamp-1">
                          {message.message}
                        </div>
                      </div>

                      {/* Data */}
                      <div className="col-span-2 min-w-[100px]">
                        <div className="text-xs text-neutral-400 text-right md:text-left">
                          {getTimeAgo(message.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {sortedMessages.length === 0 && (
                  <div className="text-center py-8 md:py-12">
                    <Mail className="w-12 h-12 md:w-16 md:h-16 text-neutral-600 mx-auto mb-3 md:mb-4" />
                    <div className="text-neutral-400 mb-2 text-sm md:text-base">
                      {searchTerm || filterStatus !== 'all'
                        ? 'Nenhuma mensagem encontrada'
                        : 'Nenhuma mensagem recebida'
                      }
                    </div>
                    <div className="text-neutral-500 text-xs md:text-sm">
                      {searchTerm || filterStatus !== 'all'
                        ? 'Tente ajustar os filtros de busca'
                        : 'As mensagens aparecerão aqui quando forem recebidas'
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
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
              <div className="p-6 border-t border-neutral-700 flex flex-col sm:flex-row justify-between gap-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: Mensagem do portfólio`}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    <Reply className="w-4 h-4" />
                    Responder
                  </a>

                  <button
                    onClick={() => toggleReadStatus(selectedMessage.id, selectedMessage.is_read)}
                    disabled={actionLoading === selectedMessage.id}
                    className={cn(
                      "flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm",
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
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
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