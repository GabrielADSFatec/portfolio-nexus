'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { ContactFormData } from '@/types/database';
import { cn } from '@/lib/utils';

export default function ContactSection() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Mensagem é obrigatória';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Mensagem deve ter pelo menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // TODO: Substituir por chamada real à API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[name as keyof ContactFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <section id="contato" className="py-20 bg-neutral-50">
      <div className="container">
        {/* Header da seção */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            Vamos <span className="gradient-text">Conversar</span>
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Tem um projeto em mente? Gostaria de trocar ideias? Estou sempre aberto para novas oportunidades e parcerias.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Informações de contato */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-neutral-900 mb-6">
                Entre em Contato
              </h3>
              <p className="text-neutral-600 mb-8 text-lg">
                Prefere conversar diretamente? Fico feliz em atender através dos canais abaixo:
              </p>
            </div>

            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-start gap-4 group">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <Mail className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-1">Email</h4>
                  <a
                    href="mailto:contato@seusite.com"
                    className="text-neutral-600 hover:text-primary-600 transition-colors"
                  >
                    contato@seusite.com
                  </a>
                  <p className="text-sm text-neutral-500 mt-1">
                    Respondo em até 24h
                  </p>
                </div>
              </div>

              {/* Telefone */}
              <div className="flex items-start gap-4 group">
                <div className="flex-shrink-0 w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center group-hover:bg-secondary-200 transition-colors">
                  <Phone className="w-6 h-6 text-secondary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-1">Telefone</h4>
                  <a
                    href="tel:+5511999999999"
                    className="text-neutral-600 hover:text-secondary-600 transition-colors"
                  >
                    +55 (11) 99999-9999
                  </a>
                  <p className="text-sm text-neutral-500 mt-1">
                    Seg à Sex, 9h às 18h
                  </p>
                </div>
              </div>

              {/* Localização */}
              <div className="flex items-start gap-4 group">
                <div className="flex-shrink-0 w-12 h-12 bg-accent-blue/10 rounded-lg flex items-center justify-center group-hover:bg-accent-blue/20 transition-colors">
                  <MapPin className="w-6 h-6 text-accent-blue" />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-1">Localização</h4>
                  <p className="text-neutral-600">São Paulo, SP - Brasil</p>
                  <p className="text-sm text-neutral-500 mt-1">
                    Trabalho remotamente
                  </p>
                </div>
              </div>
            </div>

            {/* Disponibilidade */}
            <div className="bg-white p-6 rounded-xl border border-neutral-200">
              <h4 className="font-semibold text-neutral-900 mb-3">
                Status de Disponibilidade
              </h4>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 font-medium">Disponível para novos projetos</span>
              </div>
              <p className="text-sm text-neutral-500">
                Posso começar em janeiro de 2025
              </p>
            </div>
          </div>

          {/* Formulário de contato */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-semibold text-neutral-900 mb-6">
              Envie uma Mensagem
            </h3>

            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-green-800 font-medium">Mensagem enviada com sucesso!</p>
                  <p className="text-green-600 text-sm">Responderei em breve.</p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium">Erro ao enviar mensagem</p>
                  <p className="text-red-600 text-sm">Tente novamente ou use outro meio de contato.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome */}
              <div>
                <label htmlFor="name" className="label">
                  Nome *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={cn(
                    'input',
                    errors.name && 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  )}
                  placeholder="Seu nome completo"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="label">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={cn(
                    'input',
                    errors.email && 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  )}
                  placeholder="seu@email.com"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Mensagem */}
              <div>
                <label htmlFor="message" className="label">
                  Mensagem *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  className={cn(
                    'textarea',
                    errors.message && 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  )}
                  placeholder="Conte-me sobre seu projeto, ideia ou como posso ajudá-lo..."
                  disabled={isSubmitting}
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                )}
              </div>

              {/* Botão de envio */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full group"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar Mensagem
                    <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <p className="text-sm text-neutral-500 mt-4 text-center">
              * Campos obrigatórios
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}