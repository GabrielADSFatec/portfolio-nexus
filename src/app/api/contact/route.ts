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

// Validação
function validateContactData(data: unknown): data is ContactFormData {
  if (typeof data !== 'object' || data === null) return false;
  const candidate = data as Record<string, unknown>;
  return (
    typeof candidate.name === 'string' && candidate.name.trim().length > 0 &&
    typeof candidate.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.email) &&
    typeof candidate.message === 'string' && candidate.message.trim().length >= 10
  );
}

// Configurar Nodemailer com mais opções
function createTransporter() {
  console.log('📍 [SMTP] Configurando transporter para:', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    hasPass: !!process.env.SMTP_PASS
  });

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Variáveis SMTP não configuradas');
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true para 465, false para 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Configurações adicionais para Gmail
    tls: {
      rejectUnauthorized: false
    },
    logger: true,
    debug: true
  });
}

export async function POST(request: NextRequest) {
  console.log('📍 [API Contact] Iniciando requisição POST...');
  
  try {
    // 1. Validar dados
    const body = await request.json();
    
    if (!body.payload) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }

    const { payload } = body;
    
    if (!validateContactData(payload)) {
      return NextResponse.json({ error: 'Dados inválidos. Verifique os campos.' }, { status: 400 });
    }

    const { name, email, message } = payload;
    console.log('✅ Dados validados:', { name, email, messageLength: message.length });

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
      console.error('❌ Erro no Supabase:', dbError);
      return NextResponse.json({ error: 'Erro ao salvar mensagem.' }, { status: 500 });
    }

    console.log('✅ Mensagem salva no Supabase com ID:', savedMessage.id);

    // 3. Tentar enviar email
    let emailSuccess = false;
    let emailError = null;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = createTransporter();

        // Testar conexão
        console.log('📍 Testando conexão SMTP...');
        await transporter.verify();
        console.log('✅ Conexão SMTP OK');

        // Email de notificação
        await transporter.sendMail({
          from: `"Portfolio" <${process.env.SMTP_USER}>`,
          to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
          replyTo: email,
          subject: `Nova mensagem de ${name}`,
          html: `
            <div style="font-family: Arial, sans-serif;">
              <h3>Nova mensagem do portfolio</h3>
              <p><strong>Nome:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Mensagem:</strong></p>
              <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
          `,
        });

        emailSuccess = true;
        console.log('✅ Email enviado com sucesso');

      } catch (smtpError: any) {
        emailError = smtpError;
        console.error('❌ Erro SMTP detalhado:', {
          message: smtpError.message,
          code: smtpError.code,
          response: smtpError.response,
          stack: smtpError.stack
        });
      }
    }

    // 4. Resposta
    return NextResponse.json({
      success: true,
      message: 'Mensagem enviada com sucesso!',
      id: savedMessage.id,
      emailSent: emailSuccess,
      warning: emailError ? 'Email não enviado, mas mensagem salva' : undefined
    });

  } catch (error: any) {
    console.error('💥 Erro geral:', error);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'API OK', timestamp: new Date().toISOString() });
}