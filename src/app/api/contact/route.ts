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

// Validação type-safe
function validateContactData(data: unknown): data is ContactFormData {
  if (typeof data !== 'object' || data === null) return false;
  
  const candidate = data as Record<string, unknown>;
  return (
    typeof candidate.name === 'string' && candidate.name.trim().length > 0 &&
    typeof candidate.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.email) &&
    typeof candidate.message === 'string' && candidate.message.trim().length >= 10
  );
}

// Configurar Nodemailer (sem logs excessivos)
function createTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Variáveis SMTP não configuradas');
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    // 1. Validar dados
    const body = await request.json() as RequestBody;
    
    if (!body.payload) {
      return NextResponse.json(
        { error: 'Dados inválidos. Estrutura incorreta.' },
        { status: 400 }
      );
    }

    const { payload } = body;
    
    if (!validateContactData(payload)) {
      return NextResponse.json(
        { error: 'Dados inválidos. Verifique os campos e tente novamente.' },
        { status: 400 }
      );
    }

    const { name, email, message } = payload;

    // 2. Salvar no Supabase
    const supabase = await createClient();
    
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
      console.error('Erro ao salvar mensagem:', dbError);
      return NextResponse.json(
        { error: 'Erro interno. Tente novamente mais tarde.' },
        { status: 500 }
      );
    }

    // 3. Enviar email (se configurado)
    let emailSuccess = false;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = createTransporter();

        // Email de notificação para o dono do site
        await transporter.sendMail({
          from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
          to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
          replyTo: email,
          subject: `[NexusJr] Nova mensagem de ${name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
                Nova Mensagem do Portfolio NexusJr
              </h2>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Nome:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                <p><strong>ID:</strong> ${savedMessage.id}</p>
              </div>
              
              <div style="background: white; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h3 style="color: #334155; margin-top: 0;">Mensagem:</h3>
                <p style="line-height: 1.6; color: #475569;">${message.replace(/\n/g, '<br>')}</p>
              </div>
            </div>
          `,
        });

        // Email de confirmação para o remetente (opcional)
        await transporter.sendMail({
          from: `"NexusJr" <${process.env.SMTP_USER}>`,
          to: email,
          subject: 'Mensagem recebida - Obrigado pelo contato!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Obrigado pelo contato, ${name}! 👋</h2>
              
              <p>Recebemos sua mensagem, muito obrigado!.</p>
              
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Sua mensagem:</strong></p>
                <p style="font-style: italic; color: #64748b;">"${message.substring(0, 200)}${message.length > 200 ? '...' : ''}"</p>
              </div>
              
              <p>Normalmente respondemos em 1 semana.</p>
              
              <p>Atenciosamente,<br><strong>NexusJr</strong></p>
            </div>
          `,
        });

        emailSuccess = true;
        console.log('✅ Email enviado com sucesso');

      } catch (emailError) {
        console.log('⚠️ Email não enviado (mensagem salva no banco)');
        // Não falhar a requisição se o email não enviar
      }
    }

    // 4. Resposta de sucesso
    return NextResponse.json({
      success: true,
      message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
      id: savedMessage.id,
      emailSent: emailSuccess
    });

  } catch (error) {
    console.error('Erro na API de contato:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}

// Método GET para teste (opcional)
export async function GET() {
  return NextResponse.json({
    message: 'API de contato funcionando',
    timestamp: new Date().toISOString(),
  });
}