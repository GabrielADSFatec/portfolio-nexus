import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import nodemailer from 'nodemailer';

// Tipos
interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

interface RequestBody {
  payload: ContactFormData;
  meta: { ts: string };
}

// Validação simples e type-safe
function validateContactData(data: unknown): data is ContactFormData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const candidate = data as Record<string, unknown>;

  return (
    typeof candidate.name === 'string' && candidate.name.trim().length > 0 &&
    typeof candidate.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.email) &&
    typeof candidate.message === 'string' && candidate.message.trim().length >= 10
  );
}

// Configurar Nodemailer
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function POST(request: NextRequest) {
  console.log('📍 [API Contact] Iniciando requisição POST...');
  
  try {
    // 1. Validar dados
    console.log('📍 [API Contact] Lendo corpo da requisição...');
    const body = await request.json();
    console.log('📍 [API Contact] Dados recebidos:', JSON.stringify(body, null, 2));
    
    if (!body.payload) {
      console.log('❌ [API Contact] Payload não encontrado no corpo');
      return NextResponse.json(
        { error: 'Dados inválidos. Estrutura incorreta.' },
        { status: 400 }
      );
    }

    const { payload } = body;
    
    if (!validateContactData(payload)) {
      console.log('❌ [API Contact] Dados do formulário inválidos:', payload);
      return NextResponse.json(
        { error: 'Dados inválidos. Verifique os campos e tente novamente.' },
        { status: 400 }
      );
    }

    const { name, email, message } = payload;
    console.log('✅ [API Contact] Dados validados:', { 
      name, 
      email, 
      messageLength: message.length 
    });

    // 2. Salvar no Supabase
    console.log('📍 [API Contact] Conectando ao Supabase...');
    
    // Verificar variáveis de ambiente
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
      console.error('❌ [API Contact] Variáveis de ambiente do Supabase não configuradas');
      return NextResponse.json(
        { error: 'Erro de configuração do servidor.' },
        { status: 500 }
      );
    }

    console.log('📍 [API Contact] Criando cliente Supabase...');
    const supabase = await createClient();
    
    console.log('📍 [API Contact] Inserindo mensagem na tabela contact_messages...');
    const { data: savedMessage, error: dbError } = await supabase
      .from('contact_messages')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        message: message.trim(),
        is_read: false,
        is_active: true,
      })
      .select()
      .single();

    if (dbError) {
      console.error('❌ [API Contact] Erro ao salvar mensagem no Supabase:', {
        code: dbError.code,
        message: dbError.message,
        details: dbError.details,
        hint: dbError.hint
      });
      
      // Verificar se é erro de chave primária ou de permissões
      if (dbError.code === '23505') {
        return NextResponse.json(
          { error: 'Esta mensagem já foi enviada anteriormente.' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Erro interno. Tente novamente mais tarde.' },
        { status: 500 }
      );
    }

    console.log('✅ [API Contact] Mensagem salva no Supabase com ID:', savedMessage.id);

    // 3. Enviar email (se configurado)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        console.log('📍 [API Contact] Configurando envio de email...');
        const transporter = createTransporter();

        // Verificar conexão SMTP
        console.log('📍 [API Contact] Verificando conexão SMTP...');
        await transporter.verify();

        // Email para você (receber a mensagem)
        console.log('📍 [API Contact] Enviando email de notificação...');
        await transporter.sendMail({
          from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
          to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
          replyTo: email,
          subject: `[Portfolio] Nova mensagem de ${name}`,
          text: `Nome: ${name}\nEmail: ${email}\nMensagem: ${message}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
                Nova Mensagem do Portfolio
              </h2>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Nome:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
              </div>
              
              <div style="background: white; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h3 style="color: #334155; margin-top: 0;">Mensagem:</h3>
                <p style="line-height: 1.6; color: #475569;">${message.replace(/\n/g, '<br>')}</p>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background: #dbeafe; border-radius: 8px; font-size: 14px; color: #1e40af;">
                💡 <strong>Dica:</strong> Você pode responder diretamente a este email para entrar em contato com ${name}.
              </div>
            </div>
          `,
        });

        console.log('✅ [API Contact] Email de notificação enviado com sucesso');

        // Email de confirmação para o remetente (opcional)
        console.log('📍 [API Contact] Enviando email de confirmação...');
        await transporter.sendMail({
          from: `"Seu Portfolio" <${process.env.SMTP_USER}>`,
          to: email,
          subject: 'Mensagem recebida - Obrigado pelo contato!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Obrigado pelo contato, ${name}! 👋</h2>
              
              <p>Recebi sua mensagem e entrarei em contato em breve.</p>
              
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Sua mensagem:</strong></p>
                <p style="font-style: italic; color: #64748b;">"${message.substring(0, 200)}${message.length > 200 ? '...' : ''}"</p>
              </div>
              
              <p>Normalmente respondo em até 24 horas.</p>
              
              <p>Atenciosamente,<br><strong>Seu Nome</strong></p>
            </div>
          `,
        });

        console.log('✅ [API Contact] Email de confirmação enviado com sucesso');

      } catch (emailError) {
        console.error('⚠️ [API Contact] Erro ao enviar email (não crítico):', emailError);
        // Não falhar a requisição se o email não enviar
        // A mensagem já foi salva no banco
      }
    } else {
      console.log('⚠️ [API Contact] SMTP não configurado, pulando envio de email');
    }

    // 4. Resposta de sucesso
    console.log('✅ [API Contact] Requisição concluída com sucesso');
    return NextResponse.json({
      success: true,
      message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
      id: savedMessage.id,
    });

  } catch (error) {
    console.error('💥 [API Contact] Erro geral na API:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Erro interno do servidor. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}

// Método GET para teste (opcional)
export async function GET() {
  console.log('📍 [API Contact] Teste GET recebido');
  return NextResponse.json({
    message: 'API de contato funcionando',
    timestamp: new Date().toISOString(),
  });
}