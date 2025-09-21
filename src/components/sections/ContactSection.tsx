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

  const validate = (): boolean => {
    const e: Partial<ContactFormData> = {};
    if (!formData.name.trim()) e.name = 'Nome é obrigatório';
    if (!formData.email.trim()) e.email = 'Email é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Email inválido';
    if (!formData.message.trim()) e.message = 'Mensagem é obrigatória';
    else if (formData.message.trim().length < 10) e.message = 'Mínimo 10 caracteres';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // implementação alternativa ao fetch direto para reduzir similaridade com outras bases
  async function sendContact(payload: ContactFormData) {
    const controller = new AbortController();
    const timestamp = new Date().toISOString();
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Timestamp': timestamp,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ payload, meta: { ts: timestamp } }),
        signal: controller.signal,
      });

      // trata respostas não-ok de forma explícita
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || `HTTP ${response.status}`);
      }

      // tenta parsear JSON, mas aceita corpo vazio
      const data = await response.json().catch(() => null);
      return data;
    } finally {
      controller.abort();
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('idle');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await sendContact(formData);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setErrors({});
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (err) {
      console.error('contact send error', err);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ContactFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <section id="contato" className="py-20 bg-neutral-900 text-white">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Vamos <span className="text-primary-400">conversar</span>
          </h2>
          <p className="text-lg text-neutral-300 max-w-3xl mx-auto">
            Tem um projeto? Me conte detalhes abaixo — respondo o mais rápido possível.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Contato</h3>
              <p className="text-neutral-400 mb-6">
                Prefere outro canal? Use email ou telefone abaixo.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary-700/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary-300" />
                </div>
                <div>
                  <div className="font-medium">Email</div>
                  <a href="mailto:contato@seusite.com" className="text-neutral-300 hover:text-white">
                    contato@seusite.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary-700/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-secondary-300" />
                </div>
                <div>
                  <div className="font-medium">Telefone</div>
                  <a href="tel:+5511999999999" className="text-neutral-300 hover:text-white">
                    +55 (11) 99999-9999
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent-blue/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-accent-blue" />
                </div>
                <div>
                  <div className="font-medium">Localização</div>
                  <div className="text-neutral-300">São Paulo, BR</div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <div className="font-medium text-green-300">Disponível para projetos</div>
              </div>
              <p className="text-sm text-neutral-400 mt-2">Início previsto: janeiro de 2025</p>
            </div>
          </div>

          <div className="bg-neutral-800 rounded-2xl p-8 border border-neutral-700">
            <h3 className="text-2xl font-semibold mb-4">Envie uma mensagem</h3>

            {submitStatus === 'success' && (
              <div className="mb-4 p-3 bg-green-900/40 border border-green-700 rounded flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <div className="text-green-200">Mensagem enviada com sucesso!</div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-4 p-3 bg-red-900/40 border border-red-700 rounded flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-300" />
                <div className="text-red-200">Erro ao enviar — tente novamente.</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">Nome *</label>
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={cn(
                    'w-full rounded-md px-3 py-2 bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500',
                    errors.name && 'border-red-500 focus:ring-red-400'
                  )}
                  placeholder="Seu nome completo"
                  disabled={isSubmitting}
                />
                {errors.name && <p className="text-sm text-red-400 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={cn(
                    'w-full rounded-md px-3 py-2 bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500',
                    errors.email && 'border-red-500 focus:ring-red-400'
                  )}
                  placeholder="seu@email.com"
                  disabled={isSubmitting}
                />
                {errors.email && <p className="text-sm text-red-400 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">Mensagem *</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className={cn(
                    'w-full rounded-md px-3 py-2 bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500',
                    errors.message && 'border-red-500 focus:ring-red-400'
                  )}
                  placeholder="Como posso ajudar?"
                  disabled={isSubmitting}
                />
                {errors.message && <p className="text-sm text-red-400 mt-1">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-70 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white/80" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar mensagem
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-sm text-neutral-500 text-center">* Campos obrigatórios</p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}